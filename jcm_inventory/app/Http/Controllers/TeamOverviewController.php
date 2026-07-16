<?php

namespace App\Http\Controllers;

use Carbon\CarbonImmutable;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TeamOverviewController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user, 401);

        $accountOwnerId = (int) ($user->client_id ?: $user->id);

        abort_if(
            $accountOwnerId <= 0,
            403,
            'No SaaS account owner is assigned to this user.',
        );

        $saas = DB::connection('saas');
        $inventory = DB::connection();

        $product = $saas
            ->table('products')
            ->where(
                'product_code',
                config(
                    'app.inventory_product_code',
                    env('JCM_PRODUCT_CODE', 'JCM-INVENTORY-001'),
                ),
            )
            ->first([
                'id',
                'product_code',
                'name',
                'status',
            ]);

        abort_unless(
            $product,
            404,
            'The JCM Inventory product record was not found.',
        );

        $team = $this->teamAccounts(
            saas: $saas,
            accountOwnerId: $accountOwnerId,
            productId: (int) $product->id,
        );

        $branchMap = $this->branchMap(
            inventory: $inventory,
            tenantId: $accountOwnerId,
            branchIds: $team
                ->pluck('branch_id')
                ->filter()
                ->map(static fn ($id): int => (int) $id)
                ->unique()
                ->values(),
        );

        $normalizedTeam = $team
            ->map(function ($member) use ($branchMap): array {
                $branch = $member->branch_id
                    ? $branchMap->get((int) $member->branch_id)
                    : null;

                $accessActive =
                    $member->access_status === 'active';

                $accountActive =
                    (bool) $member->account_is_active;

                return [
                    'id' => (int) $member->id,
                    'accessId' => (int) $member->access_id,
                    'name' => (string) $member->name,
                    'email' => (string) $member->email,
                    'roleCode' => (string) $member->role_code,
                    'roleName' => (string) $member->role_name,
                    'branch' => $branch
                        ? [
                            'id' => (int) $branch->id,
                            'name' => (string) $branch->name,
                            'code' => (string) $branch->code,
                            'isMain' => (bool) $branch->is_main,
                            'isActive' => (bool) $branch->is_active,
                        ]
                        : null,
                    'accessStatus' => (string) $member->access_status,
                    'accountIsActive' => $accountActive,
                    'isOperational' =>
                        $accessActive && $accountActive,
                    'isVerified' =>
                        $member->email_verified_at !== null,
                    'joinedAt' =>
                        $member->joined_at
                        ?? $member->access_created_at
                        ?? $member->user_created_at,
                ];
            })
            ->values();

        $total = $normalizedTeam->count();

        $active = $normalizedTeam
            ->where('isOperational', true)
            ->count();

        $inactive = $total - $active;

        $managers = $normalizedTeam
            ->filter(
                static fn (array $member): bool =>
                    strtolower($member['roleCode']) === 'manager',
            )
            ->count();

        $staff = $normalizedTeam
            ->filter(
                static fn (array $member): bool =>
                    strtolower($member['roleCode']) === 'staff',
            )
            ->count();

        $verified = $normalizedTeam
            ->where('isVerified', true)
            ->count();

        $assignedToBranch = $normalizedTeam
            ->filter(
                static fn (array $member): bool =>
                    $member['branch'] !== null,
            )
            ->count();

        return Inertia::render('dashboard/team-overview/index', [
            'context' => [
                'productName' => (string) $product->name,
                'productCode' => (string) $product->product_code,
                'productStatus' => (string) $product->status,
                'accountOwnerId' => $accountOwnerId,
            ],

            'summary' => [
                'total' => $total,
                'active' => $active,
                'inactive' => $inactive,
                'managers' => $managers,
                'staff' => $staff,
                'verified' => $verified,
                'unverified' => $total - $verified,
                'assignedToBranch' => $assignedToBranch,
                'unassignedToBranch' =>
                    $total - $assignedToBranch,
            ],

            'accessHealth' => [
                'operational' => $active,
                'restricted' => $normalizedTeam
                    ->filter(
                        static fn (array $member): bool =>
                            $member['accessStatus'] === 'inactive'
                            || ! $member['accountIsActive'],
                    )
                    ->count(),
                'pending' => $normalizedTeam
                    ->where('accessStatus', 'pending')
                    ->count(),
                'total' => $total,
            ],

            'roleDistribution' => $this->roleDistribution(
                team: $normalizedTeam,
                total: $total,
            ),

            'branchCoverage' => $this->branchCoverage(
                inventory: $inventory,
                tenantId: $accountOwnerId,
                team: $normalizedTeam,
            ),

            'onboardingTrend' => $this->onboardingTrend(
                team: $normalizedTeam,
            ),

            'recentMembers' => $normalizedTeam
                ->sortByDesc(
                    static fn (array $member): string =>
                        (string) ($member['joinedAt'] ?? ''),
                )
                ->take(6)
                ->values()
                ->all(),

            'signals' => [
                [
                    'key' => 'access',
                    'label' => $inactive === 0
                        ? 'Access synchronized'
                        : 'Access restrictions detected',
                    'description' => $inactive === 0
                        ? 'All team accounts are currently operational.'
                        : "{$inactive} team account"
                            .($inactive === 1 ? ' is' : 's are')
                            .' not fully operational.',
                    'tone' => $inactive === 0
                        ? 'emerald'
                        : 'amber',
                ],
                [
                    'key' => 'verification',
                    'label' => $verified === $total
                        ? 'Identity verification complete'
                        : 'Verification follow-up',
                    'description' => $total === 0
                        ? 'No team accounts are registered yet.'
                        : "{$verified} of {$total} account"
                            .($total === 1 ? '' : 's')
                            .' have verified email identities.',
                    'tone' => $verified === $total
                        ? 'blue'
                        : 'amber',
                ],
                [
                    'key' => 'branch',
                    'label' => $assignedToBranch === $total
                        ? 'Branch coverage complete'
                        : 'Branch assignment required',
                    'description' => $total === 0
                        ? 'Branch coverage begins after adding team members.'
                        : "{$assignedToBranch} of {$total} account"
                            .($total === 1 ? '' : 's')
                            .' have branch assignments.',
                    'tone' => $assignedToBranch === $total
                        ? 'violet'
                        : 'amber',
                ],
            ],
        ]);
    }

    private function teamAccounts(
        ConnectionInterface $saas,
        int $accountOwnerId,
        int $productId,
    ): Collection {
        return $saas
            ->table('user_product_access as upa')
            ->join('users as u', 'u.id', '=', 'upa.user_id')
            ->join(
                'product_user_types as put',
                'put.id',
                '=',
                'upa.product_user_type_id',
            )
            ->join(
                'user_types as ut',
                'ut.id',
                '=',
                'put.user_type_id',
            )
            ->where('upa.account_owner_id', $accountOwnerId)
            ->where('upa.product_id', $productId)
            ->where('ut.is_owner_type', false)
            ->where('upa.status', '!=', 'removed')
            ->select([
                'u.id',
                'u.name',
                'u.email',
                'u.email_verified_at',
                'u.branch_id',
                'u.is_active as account_is_active',
                'u.created_at as user_created_at',
                'upa.id as access_id',
                'upa.status as access_status',
                'upa.joined_at',
                'upa.created_at as access_created_at',
                'ut.type_code as role_code',
                DB::raw(
                    'COALESCE(put.display_name, ut.name) as role_name',
                ),
            ])
            ->orderByDesc('upa.joined_at')
            ->orderByDesc('upa.id')
            ->get();
    }

    private function branchMap(
        ConnectionInterface $inventory,
        int $tenantId,
        Collection $branchIds,
    ): Collection {
        if ($branchIds->isEmpty()) {
            return collect();
        }

        return $inventory
            ->table('branches')
            ->where('tenant_id', $tenantId)
            ->whereIn('id', $branchIds->all())
            ->whereNull('deleted_at')
            ->get([
                'id',
                'name',
                'code',
                'is_main',
                'is_active',
            ])
            ->keyBy(
                static fn ($branch): int =>
                    (int) $branch->id,
            );
    }

    /**
     * @return array<int, array{
     *     key: string,
     *     label: string,
     *     count: int,
     *     percentage: float
     * }>
     */
    private function roleDistribution(
        Collection $team,
        int $total,
    ): array {
        return $team
            ->groupBy('roleCode')
            ->map(function (
                Collection $members,
                string $roleCode,
            ) use ($total): array {
                $first = $members->first();

                return [
                    'key' => strtolower($roleCode),
                    'label' =>
                        (string) $first['roleName'],
                    'count' => $members->count(),
                    'percentage' => $total > 0
                        ? round(
                            ($members->count() / $total) * 100,
                            1,
                        )
                        : 0.0,
                ];
            })
            ->sortByDesc('count')
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{
     *     id: int,
     *     name: string,
     *     code: string,
     *     isMain: bool,
     *     isActive: bool,
     *     total: int,
     *     active: int,
     *     managers: int,
     *     staff: int
     * }>
     */
    private function branchCoverage(
        ConnectionInterface $inventory,
        int $tenantId,
        Collection $team,
    ): array {
        $branches = $inventory
            ->table('branches')
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'code',
                'is_main',
                'is_active',
            ]);

        return $branches
            ->map(function ($branch) use ($team): array {
                $members = $team->filter(
                    static fn (array $member): bool =>
                        (int) (
                            $member['branch']['id']
                            ?? 0
                        ) === (int) $branch->id,
                );

                return [
                    'id' => (int) $branch->id,
                    'name' => (string) $branch->name,
                    'code' => (string) $branch->code,
                    'isMain' => (bool) $branch->is_main,
                    'isActive' => (bool) $branch->is_active,
                    'total' => $members->count(),
                    'active' => $members
                        ->where('isOperational', true)
                        ->count(),
                    'managers' => $members
                        ->filter(
                            static fn (array $member): bool =>
                                strtolower(
                                    $member['roleCode'],
                                ) === 'manager',
                        )
                        ->count(),
                    'staff' => $members
                        ->filter(
                            static fn (array $member): bool =>
                                strtolower(
                                    $member['roleCode'],
                                ) === 'staff',
                        )
                        ->count(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{label: string, count: int}>
     */
    private function onboardingTrend(
        Collection $team,
    ): array {
        $now = CarbonImmutable::now();
        $start = $now
            ->startOfWeek()
            ->subWeeks(5);

        $buckets = collect(
            range(0, 5),
        )->map(function (int $offset) use ($start): array {
            $weekStart = $start->addWeeks($offset);

            return [
                'label' => $weekStart->format('M j'),
                'start' => $weekStart->startOfDay(),
                'end' => $weekStart
                    ->endOfWeek()
                    ->endOfDay(),
                'count' => 0,
            ];
        });

        foreach ($team as $member) {
            if (! $member['joinedAt']) {
                continue;
            }

            $joinedAt = CarbonImmutable::parse(
                $member['joinedAt'],
            );

            $index = $buckets->search(
                static fn (array $bucket): bool =>
                    $joinedAt->betweenIncluded(
                        $bucket['start'],
                        $bucket['end'],
                    ),
            );

            if ($index === false) {
                continue;
            }

            $bucket = $buckets->get($index);
            $bucket['count']++;

            $buckets->put($index, $bucket);
        }

        return $buckets
            ->map(
                static fn (array $bucket): array => [
                    'label' => $bucket['label'],
                    'count' => $bucket['count'],
                ],
            )
            ->values()
            ->all();
    }
}