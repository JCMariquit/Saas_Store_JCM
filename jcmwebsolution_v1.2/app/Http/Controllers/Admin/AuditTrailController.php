<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AuditTrailController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $module = trim((string) $request->query('module', ''));

        $logs = DB::table('platform_audit_logs as logs')
            ->leftJoin('users', 'users.id', '=', 'logs.actor_user_id')
            ->when($search !== '', fn ($query) => $query->where(function ($sub) use ($search): void {
                $sub->where('logs.description', 'like', "%{$search}%")
                    ->orWhere('logs.action', 'like', "%{$search}%")
                    ->orWhere('logs.subject_type', 'like', "%{$search}%")
                    ->orWhere('users.name', 'like', "%{$search}%");
            }))
            ->when($module !== '', fn ($query) => $query->where('logs.module', $module))
            ->select('logs.*', 'users.name as actor_name', 'users.email as actor_email')
            ->orderByDesc('logs.id')->paginate(20)->withQueryString();

        return Inertia::render('admin/audit-trail/index', [
            'logs' => $logs, 'filters' => ['search' => $search, 'module' => $module],
            'modules' => DB::table('platform_audit_logs')->distinct()->orderBy('module')->pluck('module'),
        ]);
    }
}
