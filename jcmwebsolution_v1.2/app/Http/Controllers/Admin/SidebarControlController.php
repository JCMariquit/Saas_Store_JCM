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

class SidebarControlController extends Controller
{
    public function index(Request $request): Response
    {
        $productId = $request->integer('product_id') ?: (int) DB::table('products')->orderBy('sort_order')->value('id');

        return Inertia::render('admin/sidebar-controls/index', [
            'platformItems' => DB::table('platform_sidebar_items')->orderBy('sort_order')->orderBy('id')->get(),
            'productItems' => DB::table('sidebar_items')->where('product_id', $productId)->orderBy('sort_order')->orderBy('id')->get(),
            'products' => DB::table('products')->orderBy('sort_order')->get(['id', 'name', 'product_code']),
            'selectedProductId' => $productId,
            'features' => DB::table('app_features')->where('product_id', $productId)->orderBy('sort_order')->get(['id', 'name', 'feature_code']),
            'badges' => DB::table('sidebar_badges')->where('status', 'active')->orderBy('sort_order')->get(['id', 'badge_code', 'name']),
            'productRoles' => DB::table('product_user_types as roles')
                ->join('user_types', 'user_types.id', '=', 'roles.user_type_id')
                ->where('roles.product_id', $productId)->where('roles.status', 'active')
                ->select('roles.id', DB::raw("COALESCE(roles.display_name, user_types.name) as name"))->get(),
        ]);
    }

    public function storePlatform(Request $request, PlatformAuditLogger $audit): RedirectResponse
    {
        $validated = $this->validatePlatform($request);
        $id = DB::table('platform_sidebar_items')->insertGetId($validated + ['created_at' => now(), 'updated_at' => now()]);
        $audit->write($request, 'sidebar', 'created', 'Created a Flagship sidebar item.', 'platform_sidebar_item', $id, null, $validated);
        return back()->with('success', 'Flagship sidebar item created.');
    }

    public function updatePlatform(Request $request, int $item, PlatformAuditLogger $audit): RedirectResponse
    {
        $old = DB::table('platform_sidebar_items')->where('id', $item)->first(); abort_unless($old, 404);
        $validated = $this->validatePlatform($request, $item);
        DB::table('platform_sidebar_items')->where('id', $item)->update($validated + ['updated_at' => now()]);
        $audit->write($request, 'sidebar', 'updated', 'Updated a Flagship sidebar item.', 'platform_sidebar_item', $item, $old, $validated);
        return back()->with('success', 'Flagship sidebar item updated.');
    }

    public function destroyPlatform(Request $request, int $item, PlatformAuditLogger $audit): RedirectResponse
    {
        $old = DB::table('platform_sidebar_items')->where('id', $item)->first(); abort_unless($old, 404);
        DB::table('platform_sidebar_items')->where('id', $item)->delete();
        $audit->write($request, 'sidebar', 'deleted', 'Deleted a Flagship sidebar item.', 'platform_sidebar_item', $item, $old);
        return back()->with('success', 'Flagship sidebar item deleted.');
    }

    public function storeProduct(Request $request, PlatformAuditLogger $audit): RedirectResponse
    {
        $validated = $this->validateProduct($request);
        $id = DB::table('sidebar_items')->insertGetId($validated + ['created_at' => now(), 'updated_at' => now()]);
        $this->syncRoleVisibility($id, $request->input('role_ids', []));
        $audit->write($request, 'sidebar', 'created_product_item', 'Created a product sidebar item.', 'sidebar_item', $id, null, $validated);
        return back()->with('success', 'Product sidebar item created.');
    }

    public function updateProduct(Request $request, int $item, PlatformAuditLogger $audit): RedirectResponse
    {
        $old = DB::table('sidebar_items')->where('id', $item)->first(); abort_unless($old, 404);
        $validated = $this->validateProduct($request, $item);
        DB::table('sidebar_items')->where('id', $item)->update($validated + ['updated_at' => now()]);
        $this->syncRoleVisibility($item, $request->input('role_ids', []));
        $audit->write($request, 'sidebar', 'updated_product_item', 'Updated a product sidebar item.', 'sidebar_item', $item, $old, $validated);
        return back()->with('success', 'Product sidebar item updated.');
    }

    public function destroyProduct(Request $request, int $item, PlatformAuditLogger $audit): RedirectResponse
    {
        $old = DB::table('sidebar_items')->where('id', $item)->first(); abort_unless($old, 404);
        DB::table('sidebar_items')->where('id', $item)->delete();
        $audit->write($request, 'sidebar', 'deleted_product_item', 'Deleted a product sidebar item.', 'sidebar_item', $item, $old);
        return back()->with('success', 'Product sidebar item deleted.');
    }

    private function validatePlatform(Request $request, ?int $ignore = null): array
    {
        $validated = $request->validate([
            'parent_id' => ['nullable', 'integer', 'exists:platform_sidebar_items,id'],
            'item_key' => ['required', 'alpha_dash', 'max:100', Rule::unique('platform_sidebar_items')->ignore($ignore)],
            'item_type' => ['required', Rule::in(['group', 'link', 'heading'])],
            'label' => ['required', 'string', 'max:150'], 'route_name' => ['nullable', 'string', 'max:200'],
            'url_override' => ['nullable', 'string', 'max:255'], 'icon_key' => ['nullable', 'string', 'max:100'],
            'badge' => ['nullable', 'string', 'max:30'], 'sort_order' => ['required', 'integer', 'min:0'],
            'allowed_roles' => ['nullable', 'array'], 'allowed_roles.*' => [Rule::in(['super_admin', 'admin'])],
            'is_visible' => ['required', 'boolean'], 'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);
        $validated['allowed_roles'] = json_encode($validated['allowed_roles'] ?? ['super_admin', 'admin']);
        return $validated;
    }

    private function validateProduct(Request $request, ?int $ignore = null): array
    {
        return $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'], 'parent_id' => ['nullable', 'integer', 'exists:sidebar_items,id'],
            'feature_id' => ['nullable', 'integer', 'exists:app_features,id'],
            'item_key' => ['required', 'alpha_dash', 'max:100', Rule::unique('sidebar_items')->where('product_id', $request->integer('product_id'))->ignore($ignore)],
            'section_key' => ['required', 'alpha_dash', 'max:100'], 'item_type' => ['required', Rule::in(['link', 'group', 'heading'])],
            'label' => ['required', 'string', 'max:150'], 'route_name' => ['nullable', 'string', 'max:200'],
            'url_override' => ['nullable', 'string', 'max:255'], 'icon_key' => ['nullable', 'string', 'max:100'],
            'badge' => ['nullable', 'string', 'max:30'], 'badge_id' => ['nullable', 'integer', 'exists:sidebar_badges,id'],
            'sort_order' => ['required', 'integer', 'min:0'], 'is_developer_ready' => ['required', 'boolean'],
            'is_visible' => ['required', 'boolean'], 'status' => ['required', Rule::in(['active', 'inactive'])],
        ]);
    }

    private function syncRoleVisibility(int $sidebarItemId, array $roleIds): void
    {
        DB::table('product_user_type_sidebar_items')->where('sidebar_item_id', $sidebarItemId)->delete();
        foreach (array_unique(array_map('intval', $roleIds)) as $roleId) {
            DB::table('product_user_type_sidebar_items')->insert([
                'product_user_type_id' => $roleId, 'sidebar_item_id' => $sidebarItemId,
                'is_enabled' => true, 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }
}
