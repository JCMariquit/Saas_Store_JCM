<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManagerStaffActivityController extends Controller
{
    private function managerBranch(): Branch
    {
        $user = auth()->user();

        abort_if(!$user->branch_id, 403, 'No branch assigned to this manager.');
        abort_if(!$user->client_id, 403, 'No client assigned to this manager.');

        return Branch::query()
            ->where('id', $user->branch_id)
            ->where('tenant_id', $user->client_id)
            ->where('is_active', true)
            ->firstOrFail(['id', 'tenant_id', 'name', 'code', 'is_main', 'is_active']);
    }

    public function index(Request $request)
    {
        $branch = $this->managerBranch();

        $tenantId = (int) $branch->tenant_id;
        $branchId = (int) $branch->id;

        $filters = [
            'search' => trim((string) $request->input('search', '')),
            'module' => $request->input('module'),
            'action' => $request->input('action'),
            'date_from' => $request->input('date_from'),
            'date_to' => $request->input('date_to'),
        ];

        $baseQuery = ActivityLog::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId);

        $summary = [
            'total_logs' => (clone $baseQuery)->count(),
            'today_logs' => (clone $baseQuery)->whereDate('created_at', now()->toDateString())->count(),
            'cash_drawer_logs' => (clone $baseQuery)->where('module', 'cash_drawer')->count(),
            'employee_logs' => (clone $baseQuery)->where('module', 'employee')->count(),
            'category_logs' => (clone $baseQuery)->where('module', 'categories')->count(),
        ];

        $logs = $baseQuery
            ->when($filters['search'], function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->where('description', 'like', "%{$search}%")
                        ->orWhere('module', 'like', "%{$search}%")
                        ->orWhere('action', 'like', "%{$search}%")
                        ->orWhere('role', 'like', "%{$search}%");
                });
            })
            ->when($filters['module'], fn ($query, $module) => $query->where('module', $module))
            ->when($filters['action'], fn ($query, $action) => $query->where('action', $action))
            ->when($filters['date_from'], fn ($query, $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'], fn ($query, $date) => $query->whereDate('created_at', '<=', $date))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        $modules = ActivityLog::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->select('module')
            ->distinct()
            ->orderBy('module')
            ->pluck('module');

        $actions = ActivityLog::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->select('action')
            ->distinct()
            ->orderBy('action')
            ->pluck('action');

        return Inertia::render('staff/manager/staff-activity/index', [
            'branch' => $branch,
            'logs' => $logs,
            'summary' => $summary,
            'filters' => $filters,
            'modules' => $modules,
            'actions' => $actions,
        ]);
    }
}