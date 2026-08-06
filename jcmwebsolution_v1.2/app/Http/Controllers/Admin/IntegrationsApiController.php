<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PlatformAuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class IntegrationsApiController extends Controller
{
    public function __construct(private readonly PlatformAuditLogger $audit)
    {
    }

    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $status = trim((string) $request->string('status'));

        $query = DB::table('api_integrations')
            ->leftJoin('users as creators', 'creators.id', '=', 'api_integrations.created_by')
            ->select([
                'api_integrations.id',
                'api_integrations.name',
                'api_integrations.integration_code',
                'api_integrations.provider',
                'api_integrations.base_url',
                'api_integrations.webhook_url',
                'api_integrations.environment',
                'api_integrations.status',
                'api_integrations.scopes',
                'api_integrations.secret_last_four',
                'api_integrations.last_used_at',
                'api_integrations.created_at',
                'creators.name as creator_name',
            ])
            ->when($search !== '', function ($builder) use ($search): void {
                $builder->where(function ($nested) use ($search): void {
                    $nested->where('api_integrations.name', 'like', "%{$search}%")
                        ->orWhere('api_integrations.integration_code', 'like', "%{$search}%")
                        ->orWhere('api_integrations.provider', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['active', 'inactive', 'error'], true), function ($builder) use ($status): void {
                $builder->where('api_integrations.status', $status);
            })
            ->orderByDesc('api_integrations.id');

        $integrations = $query->paginate(15)->withQueryString();
        $integrations->getCollection()->transform(function (object $row): object {
            $row->scopes = $this->decodeJsonArray($row->scopes ?? null);

            return $row;
        });

        $stats = [
            'total' => DB::table('api_integrations')->count(),
            'active' => DB::table('api_integrations')->where('status', 'active')->count(),
            'sandbox' => DB::table('api_integrations')->where('environment', 'sandbox')->count(),
            'production' => DB::table('api_integrations')->where('environment', 'production')->count(),
        ];

        return Inertia::render('admin/integrations-api/index', [
            'integrations' => $integrations,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'integration_code' => ['nullable', 'string', 'max:100', 'regex:/^[a-z0-9][a-z0-9._-]*$/', 'unique:api_integrations,integration_code'],
            'provider' => ['required', 'string', 'max:120'],
            'base_url' => ['nullable', 'url', 'max:500'],
            'webhook_url' => ['nullable', 'url', 'max:500'],
            'environment' => ['required', Rule::in(['local', 'sandbox', 'production'])],
            'status' => ['required', Rule::in(['active', 'inactive', 'error'])],
            'scopes' => ['nullable', 'array'],
            'scopes.*' => ['string', 'max:100'],
        ]);

        $secret = Str::random(64);
        $code = $validated['integration_code'] ?: Str::slug($validated['name']).'-'.Str::lower(Str::random(6));

        $id = DB::table('api_integrations')->insertGetId([
            'name' => $validated['name'],
            'integration_code' => $code,
            'provider' => $validated['provider'],
            'base_url' => $validated['base_url'] ?: null,
            'webhook_url' => $validated['webhook_url'] ?: null,
            'environment' => $validated['environment'],
            'status' => $validated['status'],
            'scopes' => json_encode(array_values(array_unique($validated['scopes'] ?? [])), JSON_UNESCAPED_SLASHES),
            'secret_encrypted' => Crypt::encryptString($secret),
            'secret_last_four' => substr($secret, -4),
            'created_by' => $request->user()?->getKey(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'integrations_api',
            'created',
            "Created API integration {$validated['name']}.",
            'api_integrations',
            $id,
            null,
            ['name' => $validated['name'], 'provider' => $validated['provider'], 'environment' => $validated['environment']],
        );

        return back()->with('success', 'Integration created. Use Reveal Secret to copy its credential.');
    }

    public function update(Request $request, int $integration): RedirectResponse
    {
        $existing = DB::table('api_integrations')->where('id', $integration)->first();
        abort_unless($existing, 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'provider' => ['required', 'string', 'max:120'],
            'base_url' => ['nullable', 'url', 'max:500'],
            'webhook_url' => ['nullable', 'url', 'max:500'],
            'environment' => ['required', Rule::in(['local', 'sandbox', 'production'])],
            'status' => ['required', Rule::in(['active', 'inactive', 'error'])],
            'scopes' => ['nullable', 'array'],
            'scopes.*' => ['string', 'max:100'],
        ]);

        DB::table('api_integrations')->where('id', $integration)->update([
            'name' => $validated['name'],
            'provider' => $validated['provider'],
            'base_url' => $validated['base_url'] ?: null,
            'webhook_url' => $validated['webhook_url'] ?: null,
            'environment' => $validated['environment'],
            'status' => $validated['status'],
            'scopes' => json_encode(array_values(array_unique($validated['scopes'] ?? [])), JSON_UNESCAPED_SLASHES),
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'integrations_api',
            'updated',
            "Updated API integration {$validated['name']}.",
            'api_integrations',
            $integration,
            $existing,
            $validated,
        );

        return back()->with('success', 'Integration updated.');
    }

    public function rotate(Request $request, int $integration): RedirectResponse
    {
        $existing = DB::table('api_integrations')->where('id', $integration)->first();
        abort_unless($existing, 404);

        $secret = Str::random(64);

        DB::table('api_integrations')->where('id', $integration)->update([
            'secret_encrypted' => Crypt::encryptString($secret),
            'secret_last_four' => substr($secret, -4),
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'integrations_api',
            'secret_rotated',
            "Rotated the secret for {$existing->name}.",
            'api_integrations',
            $integration,
        );

        return back()->with('success', 'Integration secret rotated.');
    }

    public function reveal(Request $request, int $integration): JsonResponse
    {
        $record = DB::table('api_integrations')->where('id', $integration)->first();
        abort_unless($record, 404);

        $this->audit->write(
            $request,
            'integrations_api',
            'secret_revealed',
            "Revealed the secret for {$record->name}.",
            'api_integrations',
            $integration,
        );

        return response()->json([
            'secret' => Crypt::decryptString($record->secret_encrypted),
        ]);
    }

    public function destroy(Request $request, int $integration): RedirectResponse
    {
        $record = DB::table('api_integrations')->where('id', $integration)->first();
        abort_unless($record, 404);

        DB::table('api_integrations')->where('id', $integration)->delete();

        $this->audit->write(
            $request,
            'integrations_api',
            'deleted',
            "Deleted API integration {$record->name}.",
            'api_integrations',
            $integration,
            $record,
        );

        return back()->with('success', 'Integration deleted.');
    }

    private function decodeJsonArray(mixed $value): array
    {
        $decoded = json_decode((string) $value, true);

        return is_array($decoded) ? array_values($decoded) : [];
    }
}
