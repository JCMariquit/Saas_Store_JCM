<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PlatformAuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SystemAccessController extends Controller
{
    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $productId = $request->integer('product_id') ?: null;

        $access = DB::table('user_product_access as access')
            ->join('users', 'users.id', '=', 'access.user_id')
            ->join('users as owners', 'owners.id', '=', 'access.account_owner_id')
            ->join('products', 'products.id', '=', 'access.product_id')
            ->join('product_user_types as roles', 'roles.id', '=', 'access.product_user_type_id')
            ->leftJoin('user_types', 'user_types.id', '=', 'roles.user_type_id')
            ->leftJoin('subscriptions', 'subscriptions.id', '=', 'access.subscription_id')
            ->when($search !== '', fn ($query) => $query->where(function ($sub) use ($search): void {
                $sub->where('users.name', 'like', "%{$search}%")
                    ->orWhere('users.email', 'like', "%{$search}%")
                    ->orWhere('owners.name', 'like', "%{$search}%")
                    ->orWhere('products.name', 'like', "%{$search}%");
            }))
            ->when($productId, fn ($query) => $query->where('access.product_id', $productId))
            ->select([
                'access.id', 'access.user_id', 'access.account_owner_id', 'access.product_id',
                'access.product_user_type_id', 'access.subscription_id', 'access.status',
                'access.joined_at', 'users.name as user_name', 'users.email as user_email',
                'owners.name as owner_name', 'products.name as product_name', 'products.product_code',
                'roles.display_name as role_name', 'user_types.type_code as role_code',
                'subscriptions.status as subscription_status',
            ])
            ->orderByDesc('access.id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/systems/access', [
            'access' => $access,
            'filters' => ['search' => $search, 'product_id' => $productId],
            'products' => DB::table('products')->orderBy('sort_order')->get(['id', 'name']),
            'roles' => DB::table('product_user_types as roles')
                ->join('user_types', 'user_types.id', '=', 'roles.user_type_id')
                ->where('roles.status', 'active')
                ->select('roles.id', 'roles.product_id', DB::raw("COALESCE(roles.display_name, user_types.name) as name"), 'user_types.type_code')
                ->orderBy('roles.product_id')->orderBy('user_types.sort_order')->get(),
        ]);
    }

    public function update(Request $request, int $access, PlatformAuditLogger $audit): RedirectResponse
    {
        $row = DB::table('user_product_access')->where('id', $access)->first();
        abort_unless($row, 404);

        $validated = $request->validate([
            'product_user_type_id' => ['required', 'integer', Rule::exists('product_user_types', 'id')->where('product_id', $row->product_id)],
            'status' => ['required', Rule::in(['pending', 'active', 'inactive', 'removed'])],
        ]);

        DB::table('user_product_access')->where('id', $access)->update($validated + ['updated_at' => now()]);
        $audit->write($request, 'system_access', 'updated', 'Updated product access assignment.', 'user_product_access', $access, $row, $validated);

        return back()->with('success', 'System access updated successfully.');
    }
}
