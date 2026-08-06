<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PlatformAuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SystemHealthController extends Controller
{
    public function __construct(private readonly PlatformAuditLogger $audit)
    {
    }

    public function index(): Response
    {
        $latest = DB::table('system_health_snapshots')
            ->leftJoin('users', 'users.id', '=', 'system_health_snapshots.created_by')
            ->select('system_health_snapshots.*', 'users.name as checked_by_name')
            ->orderByDesc('system_health_snapshots.id')
            ->first();

        if ($latest) {
            $latest->checks = $this->decodeChecks($latest->checks);
        }

        $history = DB::table('system_health_snapshots')
            ->leftJoin('users', 'users.id', '=', 'system_health_snapshots.created_by')
            ->select([
                'system_health_snapshots.id',
                'system_health_snapshots.overall_status',
                'system_health_snapshots.response_time_ms',
                'system_health_snapshots.created_at',
                'users.name as checked_by_name',
            ])
            ->orderByDesc('system_health_snapshots.id')
            ->limit(30)
            ->get();

        $current = $latest ?: (object) $this->evaluate(false);

        return Inertia::render('admin/system-health/index', [
            'latest' => $current,
            'history' => $history,
            'stats' => [
                'healthy' => DB::table('system_health_snapshots')->where('overall_status', 'healthy')->count(),
                'degraded' => DB::table('system_health_snapshots')->where('overall_status', 'degraded')->count(),
                'critical' => DB::table('system_health_snapshots')->where('overall_status', 'critical')->count(),
                'last_response_ms' => (int) ($latest->response_time_ms ?? 0),
            ],
        ]);
    }

    public function run(Request $request): RedirectResponse
    {
        $result = $this->evaluate(true, $request->user()?->getKey());

        $this->audit->write(
            $request,
            'system_health',
            'check_run',
            "Ran platform health check: {$result['overall_status']}.",
            'system_health_snapshots',
            $result['id'],
            null,
            [
                'overall_status' => $result['overall_status'],
                'response_time_ms' => $result['response_time_ms'],
            ],
        );

        return back()->with('success', 'System health check completed.');
    }

    private function evaluate(bool $persist = false, ?int $createdBy = null): array
    {
        $started = microtime(true);
        $checks = [];

        $checks[] = $this->databaseCheck();
        $checks[] = $this->requiredTablesCheck();
        $checks[] = $this->storageCheck();
        $checks[] = $this->queueCheck();
        $checks[] = $this->failedJobsCheck();
        $checks[] = $this->subscriptionIntegrityCheck();
        $checks[] = $this->stalePaymentsCheck();

        $critical = collect($checks)->where('status', 'critical')->count();
        $degraded = collect($checks)->where('status', 'degraded')->count();
        $overall = $critical > 0 ? 'critical' : ($degraded > 0 ? 'degraded' : 'healthy');
        $responseMs = (int) round((microtime(true) - $started) * 1000);

        $payload = [
            'overall_status' => $overall,
            'checks' => $checks,
            'response_time_ms' => $responseMs,
            'created_at' => now()->toISOString(),
        ];

        if ($persist) {
            $payload['id'] = DB::table('system_health_snapshots')->insertGetId([
                'overall_status' => $overall,
                'checks' => json_encode($checks, JSON_UNESCAPED_SLASHES),
                'response_time_ms' => $responseMs,
                'created_by' => $createdBy,
                'created_at' => now(),
            ]);
        }

        return $payload;
    }

    private function databaseCheck(): array
    {
        $started = microtime(true);

        try {
            DB::select('SELECT 1 AS ok');
            $milliseconds = (int) round((microtime(true) - $started) * 1000);

            return [
                'key' => 'database',
                'label' => 'Primary database',
                'status' => $milliseconds > 500 ? 'degraded' : 'healthy',
                'message' => "Database responded in {$milliseconds} ms.",
                'value' => $milliseconds,
                'unit' => 'ms',
            ];
        } catch (Throwable $error) {
            return [
                'key' => 'database',
                'label' => 'Primary database',
                'status' => 'critical',
                'message' => 'Database connection failed: '.$error->getMessage(),
                'value' => null,
                'unit' => null,
            ];
        }
    }

    private function requiredTablesCheck(): array
    {
        $required = [
            'users',
            'products',
            'plans',
            'subscriptions',
            'orders',
            'transactions',
            'platform_sidebar_items',
            'platform_audit_logs',
        ];

        $missing = collect($required)->reject(fn (string $table): bool => Schema::hasTable($table))->values();

        return [
            'key' => 'required_tables',
            'label' => 'Required tables',
            'status' => $missing->isEmpty() ? 'healthy' : 'critical',
            'message' => $missing->isEmpty()
                ? 'All required platform tables are available.'
                : 'Missing tables: '.$missing->implode(', '),
            'value' => $required ? count($required) - $missing->count() : 0,
            'unit' => '/'.count($required),
        ];
    }

    private function storageCheck(): array
    {
        $paths = [
            storage_path('framework'),
            storage_path('logs'),
            storage_path('app'),
        ];

        $unwritable = collect($paths)->filter(fn (string $path): bool => ! is_dir($path) || ! is_writable($path));

        return [
            'key' => 'storage',
            'label' => 'Storage permissions',
            'status' => $unwritable->isEmpty() ? 'healthy' : 'critical',
            'message' => $unwritable->isEmpty()
                ? 'Framework, logs, and app storage paths are writable.'
                : 'One or more storage paths are not writable.',
            'value' => count($paths) - $unwritable->count(),
            'unit' => '/'.count($paths),
        ];
    }

    private function queueCheck(): array
    {
        if (! Schema::hasTable('jobs')) {
            return [
                'key' => 'queue',
                'label' => 'Queue backlog',
                'status' => 'degraded',
                'message' => 'Jobs table is not available.',
                'value' => null,
                'unit' => null,
            ];
        }

        $count = DB::table('jobs')->count();

        return [
            'key' => 'queue',
            'label' => 'Queue backlog',
            'status' => $count > 100 ? 'critical' : ($count > 20 ? 'degraded' : 'healthy'),
            'message' => $count === 0 ? 'No queued jobs are waiting.' : "{$count} queued jobs are waiting.",
            'value' => $count,
            'unit' => 'jobs',
        ];
    }

    private function failedJobsCheck(): array
    {
        if (! Schema::hasTable('failed_jobs')) {
            return [
                'key' => 'failed_jobs',
                'label' => 'Failed jobs',
                'status' => 'degraded',
                'message' => 'Failed jobs table is not available.',
                'value' => null,
                'unit' => null,
            ];
        }

        $count = DB::table('failed_jobs')->count();

        return [
            'key' => 'failed_jobs',
            'label' => 'Failed jobs',
            'status' => $count > 10 ? 'critical' : ($count > 0 ? 'degraded' : 'healthy'),
            'message' => $count === 0 ? 'No failed queue jobs.' : "{$count} failed jobs require review.",
            'value' => $count,
            'unit' => 'jobs',
        ];
    }

    private function subscriptionIntegrityCheck(): array
    {
        if (! Schema::hasTable('subscriptions')) {
            return [
                'key' => 'subscriptions',
                'label' => 'Subscription integrity',
                'status' => 'critical',
                'message' => 'Subscriptions table is not available.',
                'value' => null,
                'unit' => null,
            ];
        }

        $count = DB::table('subscriptions')
            ->whereIn('status', ['trial', 'active', 'grace_period'])
            ->whereNotNull('end_date')
            ->whereDate('end_date', '<', now()->toDateString())
            ->count();

        return [
            'key' => 'subscriptions',
            'label' => 'Subscription integrity',
            'status' => $count > 10 ? 'critical' : ($count > 0 ? 'degraded' : 'healthy'),
            'message' => $count === 0
                ? 'No active subscriptions are past their end date.'
                : "{$count} subscription records may require status synchronization.",
            'value' => $count,
            'unit' => 'records',
        ];
    }

    private function stalePaymentsCheck(): array
    {
        if (! Schema::hasTable('transactions')) {
            return [
                'key' => 'stale_payments',
                'label' => 'Pending payment review',
                'status' => 'critical',
                'message' => 'Transactions table is not available.',
                'value' => null,
                'unit' => null,
            ];
        }

        $count = DB::table('transactions')
            ->whereIn('status', ['pending', 'submitted'])
            ->where('created_at', '<', now()->subDays(3))
            ->count();

        return [
            'key' => 'stale_payments',
            'label' => 'Pending payment review',
            'status' => $count > 20 ? 'critical' : ($count > 0 ? 'degraded' : 'healthy'),
            'message' => $count === 0
                ? 'No payment submissions have been pending for more than three days.'
                : "{$count} payment submissions have been waiting for more than three days.",
            'value' => $count,
            'unit' => 'payments',
        ];
    }

    private function decodeChecks(mixed $checks): array
    {
        $decoded = json_decode((string) $checks, true);

        return is_array($decoded) ? $decoded : [];
    }
}
