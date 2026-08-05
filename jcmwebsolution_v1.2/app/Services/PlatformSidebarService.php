<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Throwable;

class PlatformSidebarService
{
    public function menuFor(?User $user): array
    {
        if (! $user?->isAdmin()) {
            return [];
        }

        if (! Schema::hasTable('platform_sidebar_items')) {
            return $this->fallback();
        }

        $role = $user->primaryPlatformRoleCode();
        $items = DB::table('platform_sidebar_items')
            ->where('status', 'active')
            ->where('is_visible', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->filter(function ($item) use ($role): bool {
                $roles = json_decode((string) ($item->allowed_roles ?? '[]'), true);

                return ! is_array($roles) || $roles === [] || in_array($role, $roles, true);
            });

        if ($items->isEmpty()) {
            return $this->fallback();
        }

        $containers = $items->filter(
            fn (object $item): bool => in_array($item->item_type, ['heading', 'group'], true)
        );

        $menu = $containers->map(function (object $container) use ($items): array {
            return [
                'key' => $container->item_key,
                'title' => $container->label,
                'icon' => $container->icon_key ?: 'FolderKanban',
                'collapsible' => $container->item_type === 'group',
                'items' => $items
                    ->where('parent_id', $container->id)
                    ->where('item_type', 'link')
                    ->map(fn (object $item): array => $this->serializeItem($item))
                    ->values()
                    ->all(),
            ];
        })->filter(fn (array $section): bool => $section['items'] !== [])->values()->all();

        return $menu !== [] ? $menu : $this->fallback();
    }

    private function serializeItem(object $item): array
    {
        $url = (string) ($item->url_override ?? '');

        if ($url === '' && $item->route_name && Route::has($item->route_name)) {
            try {
                $url = route($item->route_name, [], false);
            } catch (Throwable) {
                $url = '#';
            }
        }

        return [
            'key' => $item->item_key,
            'title' => $item->label,
            'url' => $url !== '' ? $url : '#',
            'icon' => $item->icon_key ?: 'Circle',
            'badge' => $item->badge,
        ];
    }

    private function fallback(): array
    {
        return [
            [
                'key' => 'overview',
                'title' => 'Overview',
                'icon' => 'ChartNoAxesCombined',
                'collapsible' => false,
                'items' => [
                    ['key' => 'dashboard', 'title' => 'Main Overview', 'url' => '/admin/dashboard', 'icon' => 'LayoutDashboard', 'badge' => 'MAIN'],
                    ['key' => 'sales-overview', 'title' => 'Sales Overview', 'url' => '/admin/overviews/sales', 'icon' => 'ChartColumnIncreasing', 'badge' => null],
                    ['key' => 'users-overview', 'title' => 'Users Overview', 'url' => '/admin/overviews/users', 'icon' => 'UsersRound', 'badge' => null],
                    ['key' => 'subscriptions-overview', 'title' => 'Subscriptions Overview', 'url' => '/admin/overviews/subscriptions', 'icon' => 'CalendarClock', 'badge' => null],
                    ['key' => 'systems-overview', 'title' => 'Systems Overview', 'url' => '/admin/systems', 'icon' => 'Boxes', 'badge' => null],
                ],
            ],
            [
                'key' => 'systems',
                'title' => 'Systems',
                'icon' => 'Boxes',
                'collapsible' => true,
                'items' => [
                    ['key' => 'provision-account', 'title' => 'Provision Account', 'url' => '/admin/systems/provision', 'icon' => 'UserPlus', 'badge' => null],
                    ['key' => 'system-access', 'title' => 'System Access', 'url' => '/admin/systems/access', 'icon' => 'KeyRound', 'badge' => null],
                    ['key' => 'modules-capabilities', 'title' => 'Modules & Capabilities', 'url' => '/admin/modules', 'icon' => 'Blocks', 'badge' => null],
                    ['key' => 'sidebar-controls', 'title' => 'Sidebar Controls', 'url' => '/admin/sidebar-controls', 'icon' => 'PanelLeft', 'badge' => 'DYNAMIC'],
                ],
            ],
            [
                'key' => 'platform',
                'title' => 'Platform',
                'icon' => 'ShieldCheck',
                'collapsible' => true,
                'items' => [
                    ['key' => 'users', 'title' => 'Users & Accounts', 'url' => '/admin/users', 'icon' => 'Users', 'badge' => null],
                    ['key' => 'products', 'title' => 'Product Catalog', 'url' => '/admin/products', 'icon' => 'PackageSearch', 'badge' => null],
                    ['key' => 'services', 'title' => 'Services', 'url' => '/admin/services', 'icon' => 'Wrench', 'badge' => null],
                    ['key' => 'plans', 'title' => 'Plans & Pricing', 'url' => '/admin/plans', 'icon' => 'SlidersHorizontal', 'badge' => null],
                    ['key' => 'policies', 'title' => 'Subscription Policies', 'url' => '/admin/subscription-policies', 'icon' => 'FileKey2', 'badge' => null],
                ],
            ],
            [
                'key' => 'commerce',
                'title' => 'Commerce',
                'icon' => 'ShoppingCart',
                'collapsible' => true,
                'items' => [
                    ['key' => 'orders', 'title' => 'Orders', 'url' => '/admin/orders', 'icon' => 'ReceiptText', 'badge' => null],
                    ['key' => 'payment-verification', 'title' => 'Payment Verification', 'url' => '/admin/payment-verifications', 'icon' => 'BadgeCheck', 'badge' => 'REVIEW'],
                    ['key' => 'subscriptions', 'title' => 'Subscription Control', 'url' => '/admin/subscriptions', 'icon' => 'CreditCard', 'badge' => 'CORE'],
                    ['key' => 'transactions', 'title' => 'Transactions', 'url' => '/admin/transactions', 'icon' => 'CircleDollarSign', 'badge' => null],
                    ['key' => 'payment-methods', 'title' => 'Payment Methods', 'url' => '/admin/payment-methods', 'icon' => 'WalletCards', 'badge' => null],
                ],
            ],
            [
                'key' => 'governance',
                'title' => 'Governance',
                'icon' => 'ScrollText',
                'collapsible' => true,
                'items' => [
                    ['key' => 'audit-trail', 'title' => 'Platform Audit Trail', 'url' => '/admin/audit-trail', 'icon' => 'ScrollText', 'badge' => null],
                    ['key' => 'website', 'title' => 'Website Builder', 'url' => '/admin/website/builder', 'icon' => 'Globe2', 'badge' => null],
                ],
            ],
        ];
    }
}
