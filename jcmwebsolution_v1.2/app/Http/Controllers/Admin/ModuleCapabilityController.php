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

class ModuleCapabilityController extends Controller
{
    public function index(Request $request): Response
    {
        $productId = $request->integer('product_id') ?: (int) DB::table('products')->orderBy('sort_order')->value('id');

        return Inertia::render('admin/modules/index', [
            'selectedProductId' => $productId,
            'products' => DB::table('products')->orderBy('sort_order')->get(['id', 'name', 'product_code']),
            'features' => DB::table('app_features')->where('product_id', $productId)->orderBy('sort_order')->get(),
            'roles' => DB::table('product_user_types as roles')
                ->join('user_types', 'user_types.id', '=', 'roles.user_type_id')
                ->where('roles.product_id', $productId)
                ->select('roles.*', 'user_types.type_code', 'user_types.name as base_name', 'user_types.is_owner_type')
                ->orderBy('user_types.sort_order')->get(),
            'baseUserTypes' => DB::table('user_types')->where('status', 'active')->orderBy('sort_order')->get(),
            'plans' => DB::table('plans')->where('product_id', $productId)->where('status', 'active')->orderBy('sort_order')->get(['id', 'plan_name', 'plan_code']),
            'planFeatures' => DB::table('plan_features')->where('product_id', $productId)->get(),
            'planRoles' => DB::table('plan_user_types')->where('product_id', $productId)->get(),
        ]);
    }

    public function storeFeature(Request $request, PlatformAuditLogger $audit): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'feature_code' => ['required', 'alpha_dash', 'max:100', Rule::unique('app_features')->where('product_id', $request->integer('product_id'))],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'is_developer_ready' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);
        $id = DB::table('app_features')->insertGetId($validated + ['created_at' => now(), 'updated_at' => now()]);
        $audit->write($request, 'modules', 'created', 'Created a system capability.', 'app_feature', $id, null, $validated);
        return back()->with('success', 'Capability created successfully.');
    }

    public function updateFeature(Request $request, int $feature, PlatformAuditLogger $audit): RedirectResponse
    {
        $old = DB::table('app_features')->where('id', $feature)->first(); abort_unless($old, 404);
        $validated = $request->validate([
            'feature_code' => ['required', 'alpha_dash', 'max:100', Rule::unique('app_features')->where('product_id', $old->product_id)->ignore($feature)],
            'name' => ['required', 'string', 'max:150'], 'description' => ['nullable', 'string'],
            'is_developer_ready' => ['required', 'boolean'], 'sort_order' => ['required', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);
        DB::table('app_features')->where('id', $feature)->update($validated + ['updated_at' => now()]);
        $audit->write($request, 'modules', 'updated', 'Updated a system capability.', 'app_feature', $feature, $old, $validated);
        return back()->with('success', 'Capability updated successfully.');
    }

    public function destroyFeature(Request $request, int $feature, PlatformAuditLogger $audit): RedirectResponse
    {
        $old = DB::table('app_features')->where('id', $feature)->first(); abort_unless($old, 404);
        DB::table('app_features')->where('id', $feature)->delete();
        $audit->write($request, 'modules', 'deleted', 'Deleted a system capability.', 'app_feature', $feature, $old);
        return back()->with('success', 'Capability deleted successfully.');
    }

    public function storeRole(Request $request, PlatformAuditLogger $audit): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'user_type_id' => ['required', 'integer', 'exists:user_types,id'],
            'display_name' => ['nullable', 'string', 'max:100'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);
        $id = DB::table('product_user_types')->insertGetId($validated + ['created_at' => now(), 'updated_at' => now()]);
        $audit->write($request, 'modules', 'created_role', 'Created a system role.', 'product_user_type', $id, null, $validated);
        return back()->with('success', 'Product role created successfully.');
    }

    public function updateRole(Request $request, int $role, PlatformAuditLogger $audit): RedirectResponse
    {
        $old = DB::table('product_user_types')->where('id', $role)->first(); abort_unless($old, 404);
        $validated = $request->validate(['display_name' => ['nullable', 'string', 'max:100'], 'status' => ['required', Rule::in(['active', 'inactive'])]]);
        DB::table('product_user_types')->where('id', $role)->update($validated + ['updated_at' => now()]);
        $audit->write($request, 'modules', 'updated_role', 'Updated a system role.', 'product_user_type', $role, $old, $validated);
        return back()->with('success', 'Product role updated successfully.');
    }

    public function destroyRole(Request $request, int $role, PlatformAuditLogger $audit): RedirectResponse
    {
        $old = DB::table('product_user_types')->where('id', $role)->first(); abort_unless($old, 404);
        if (DB::table('user_product_access')->where('product_user_type_id', $role)->exists()) {
            return back()->with('success', 'This role is assigned to accounts and cannot be deleted. Deactivate it instead.');
        }
        DB::table('product_user_types')->where('id', $role)->delete();
        $audit->write($request, 'modules', 'deleted_role', 'Deleted a system role.', 'product_user_type', $role, $old);
        return back()->with('success', 'Product role deleted successfully.');
    }

    public function togglePlanFeature(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer'], 'plan_id' => ['required', 'integer'],
            'feature_id' => ['required', 'integer'], 'is_enabled' => ['required', 'boolean'],
            'limit_value' => ['nullable', 'integer', 'min:0'],
        ]);
        DB::table('plan_features')->updateOrInsert(
            ['plan_id' => $validated['plan_id'], 'feature_id' => $validated['feature_id']],
            $validated + ['updated_at' => now(), 'created_at' => now()],
        );
        return back()->with('success', 'Plan capability updated.');
    }

    public function togglePlanRole(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer'], 'plan_id' => ['required', 'integer'],
            'product_user_type_id' => ['required', 'integer'], 'is_enabled' => ['required', 'boolean'],
            'max_accounts' => ['nullable', 'integer', 'min:0'],
        ]);
        DB::table('plan_user_types')->updateOrInsert(
            ['plan_id' => $validated['plan_id'], 'product_user_type_id' => $validated['product_user_type_id']],
            $validated + ['updated_at' => now(), 'created_at' => now()],
        );
        return back()->with('success', 'Plan role access updated.');
    }
}
