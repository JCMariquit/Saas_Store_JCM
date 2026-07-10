<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Models\WarehouseStock;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $this->getTenantId($request);

        $search = trim(
            (string) $request->input('search', '')
        );

        $status = trim(
            (string) $request->input('status', '')
        );

        $branchId = (int) $request->input(
            'branch_id',
            0
        );

        $warehouseId = (int) $request->input(
            'warehouse_id',
            0
        );

        $categoryId = (int) $request->input(
            'category_id',
            0
        );

        $stocks = WarehouseStock::query()
            ->where('tenant_id', $tenantId)
            ->with([
                'product' => function ($query): void {
                    $query->select([
                        'id',
                        'category_id',
                        'name',
                        'sku',
                        'barcode',
                        'unit',
                        'cost_price',
                        'selling_price',
                        'stock_tracking',
                        'is_active',
                    ]);
                },

                'product.category:id,name,slug',

                'warehouse' => function ($query): void {
                    $query->select([
                        'id',
                        'branch_id',
                        'name',
                        'code',
                        'is_main',
                        'is_active',
                    ]);
                },

                'warehouse.branch:id,name,code,is_main,is_active',
            ])
            ->when(
                $search !== '',
                function (Builder $query) use ($search): void {
                    $query->where(
                        function (Builder $query) use ($search): void {
                            $query
                                ->whereHas(
                                    'product',
                                    function (Builder $query) use ($search): void {
                                        $query
                                            ->where(
                                                'name',
                                                'like',
                                                "%{$search}%"
                                            )
                                            ->orWhere(
                                                'sku',
                                                'like',
                                                "%{$search}%"
                                            )
                                            ->orWhere(
                                                'barcode',
                                                'like',
                                                "%{$search}%"
                                            );
                                    }
                                )
                                ->orWhereHas(
                                    'warehouse',
                                    function (Builder $query) use ($search): void {
                                        $query
                                            ->where(
                                                'name',
                                                'like',
                                                "%{$search}%"
                                            )
                                            ->orWhere(
                                                'code',
                                                'like',
                                                "%{$search}%"
                                            );
                                    }
                                );
                        }
                    );
                }
            )
            ->when(
                $branchId > 0,
                fn (Builder $query) => $query->whereHas(
                    'warehouse',
                    fn (Builder $query) => $query->where(
                        'branch_id',
                        $branchId
                    )
                )
            )
            ->when(
                $warehouseId > 0,
                fn (Builder $query) => $query->where(
                    'warehouse_id',
                    $warehouseId
                )
            )
            ->when(
                $categoryId > 0,
                fn (Builder $query) => $query->whereHas(
                    'product',
                    fn (Builder $query) => $query->where(
                        'category_id',
                        $categoryId
                    )
                )
            )
            ->when(
                $status === 'in_stock',
                fn (Builder $query) => $query
                    ->where('quantity', '>', 0)
                    ->whereColumn(
                        'quantity',
                        '>',
                        'reorder_level'
                    )
            )
            ->when(
                $status === 'low_stock',
                fn (Builder $query) => $query
                    ->where('quantity', '>', 0)
                    ->whereColumn(
                        'quantity',
                        '<=',
                        'reorder_level'
                    )
            )
            ->when(
                $status === 'out_of_stock',
                fn (Builder $query) => $query->where(
                    'quantity',
                    '<=',
                    0
                )
            )
            ->orderByDesc('last_movement_at')
            ->orderByDesc('id')
            ->paginate(12)
            ->withQueryString();

        $summaryQuery = WarehouseStock::query()
            ->where('tenant_id', $tenantId);

        $totalQuantity = (float) (
            (clone $summaryQuery)->sum('quantity') ?? 0
        );

        $inventoryValue = (float) (
            (clone $summaryQuery)
                ->selectRaw(
                    'COALESCE(SUM(quantity * average_cost), 0) as total_value'
                )
                ->value('total_value') ?? 0
        );

        $branches = Branch::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->select([
                'id',
                'name',
                'code',
                'is_main',
            ])
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get();

        $warehouses = Warehouse::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->with([
                'branch:id,name,code',
            ])
            ->select([
                'id',
                'branch_id',
                'name',
                'code',
                'is_main',
            ])
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get();

        $categories = Category::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->select([
                'id',
                'parent_id',
                'name',
            ])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        $products = Product::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where('stock_tracking', 'tracked')
            ->with([
                'category:id,name',
            ])
            ->select([
                'id',
                'category_id',
                'name',
                'sku',
                'barcode',
                'unit',
                'cost_price',
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render(
            'inventory/stocks/index',
            [
                'stocks' => $stocks,

                'branches' => $branches,

                'warehouses' => $warehouses,

                'categories' => $categories,

                'products' => $products,

                'summary' => [
                    'records' => (clone $summaryQuery)
                        ->count(),

                    'total_quantity' => $totalQuantity,

                    'low_stock' => (clone $summaryQuery)
                        ->where('quantity', '>', 0)
                        ->whereColumn(
                            'quantity',
                            '<=',
                            'reorder_level'
                        )
                        ->count(),

                    'out_of_stock' => (clone $summaryQuery)
                        ->where('quantity', '<=', 0)
                        ->count(),

                    'inventory_value' => round(
                        $inventoryValue,
                        2
                    ),
                ],

                'filters' => [
                    'search' => $search,

                    'status' => $status,

                    'branch_id' => $branchId > 0
                        ? $branchId
                        : null,

                    'warehouse_id' => $warehouseId > 0
                        ? $warehouseId
                        : null,

                    'category_id' => $categoryId > 0
                        ? $categoryId
                        : null,
                ],

                'movementTypes' => [
                    [
                        'value' => 'stock_in',
                        'label' => 'Stock In',
                        'direction' => 'in',
                    ],
                    [
                        'value' => 'stock_out',
                        'label' => 'Stock Out',
                        'direction' => 'out',
                    ],
                    [
                        'value' => 'adjustment_in',
                        'label' => 'Adjustment In',
                        'direction' => 'in',
                    ],
                    [
                        'value' => 'adjustment_out',
                        'label' => 'Adjustment Out',
                        'direction' => 'out',
                    ],
                    [
                        'value' => 'return_in',
                        'label' => 'Return In',
                        'direction' => 'in',
                    ],
                    [
                        'value' => 'return_out',
                        'label' => 'Return Out',
                        'direction' => 'out',
                    ],
                    [
                        'value' => 'damage',
                        'label' => 'Damaged Stock',
                        'direction' => 'out',
                    ],
                    [
                        'value' => 'expired',
                        'label' => 'Expired Stock',
                        'direction' => 'out',
                    ],
                ],
            ]
        );
    }

    public function store(Request $request): RedirectResponse
    {
        $tenantId = $this->getTenantId($request);

        $validated = $request->validate([
            'warehouse_id' => [
                'required',
                'integer',

                Rule::exists('warehouses', 'id')
                    ->where(
                        fn ($query) => $query
                            ->where('tenant_id', $tenantId)
                            ->where('is_active', true)
                            ->whereNull('deleted_at')
                    ),
            ],

            'product_id' => [
                'required',
                'integer',

                Rule::exists('products', 'id')
                    ->where(
                        fn ($query) => $query
                            ->where('tenant_id', $tenantId)
                            ->where('is_active', true)
                            ->where(
                                'stock_tracking',
                                'tracked'
                            )
                            ->whereNull('deleted_at')
                    ),
            ],

            'opening_quantity' => [
                'required',
                'numeric',
                'min:0',
            ],

            'reorder_level' => [
                'required',
                'numeric',
                'min:0',
            ],

            'max_stock_level' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'unit_cost' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $warehouseId = (int) $validated['warehouse_id'];
        $productId = (int) $validated['product_id'];

        $existingStock = WarehouseStock::query()
            ->where('tenant_id', $tenantId)
            ->where('warehouse_id', $warehouseId)
            ->where('product_id', $productId)
            ->exists();

        if ($existingStock) {
            throw ValidationException::withMessages([
                'product_id' => 'This product already has a stock record in the selected warehouse.',
            ]);
        }

        $reorderLevel = (float) $validated[
            'reorder_level'
        ];

        $maxStockLevel = filled(
            $validated['max_stock_level'] ?? null
        )
            ? (float) $validated['max_stock_level']
            : null;

        if (
            $maxStockLevel !== null
            && $maxStockLevel < $reorderLevel
        ) {
            throw ValidationException::withMessages([
                'max_stock_level' => 'Maximum stock level must be equal to or greater than the reorder level.',
            ]);
        }

        DB::connection('mysql')->transaction(
            function () use (
                $request,
                $tenantId,
                $validated,
                $warehouseId,
                $productId,
                $reorderLevel,
                $maxStockLevel
            ): void {
                $product = Product::query()
                    ->where('tenant_id', $tenantId)
                    ->whereKey($productId)
                    ->firstOrFail();

                $openingQuantity = (float) $validated[
                    'opening_quantity'
                ];

                $unitCost = filled(
                    $validated['unit_cost'] ?? null
                )
                    ? (float) $validated['unit_cost']
                    : (float) $product->cost_price;

                $movementDate = now();

                WarehouseStock::query()->create([
                    'tenant_id' => $tenantId,
                    'warehouse_id' => $warehouseId,
                    'product_id' => $productId,

                    'quantity' => $openingQuantity,
                    'reorder_level' => $reorderLevel,
                    'max_stock_level' => $maxStockLevel,
                    'average_cost' => $unitCost,

                    'last_movement_at' => $openingQuantity > 0
                        ? $movementDate
                        : null,
                ]);

                if ($openingQuantity <= 0) {
                    return;
                }

                StockMovement::query()->create([
                    'tenant_id' => $tenantId,
                    'warehouse_id' => $warehouseId,
                    'product_id' => $productId,

                    'movement_type' => 'opening_stock',

                    'quantity' => $openingQuantity,
                    'quantity_before' => 0,
                    'quantity_after' => $openingQuantity,

                    'unit_cost' => $unitCost,
                    'total_cost' => round(
                        $openingQuantity * $unitCost,
                        2
                    ),

                    'reference_type' => 'opening_stock',
                    'reference_id' => null,

                    'reference_no' => $this->generateReferenceNumber(
                        'OPEN'
                    ),

                    'related_warehouse_id' => null,

                    'remarks' => $this->nullableString(
                        $validated['remarks'] ?? null
                    ),

                    'movement_date' => $movementDate,

                    'created_by' => $request->user()?->id,
                ]);
            }
        );

        return back()->with(
            'success',
            'Warehouse stock record created successfully.'
        );
    }

    public function updateSettings(
        Request $request,
        WarehouseStock $stock
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureStockBelongsToTenant(
            $stock,
            $tenantId
        );

        $validated = $request->validate([
            'reorder_level' => [
                'required',
                'numeric',
                'min:0',
            ],

            'max_stock_level' => [
                'nullable',
                'numeric',
                'min:0',
            ],
        ]);

        $reorderLevel = (float) $validated[
            'reorder_level'
        ];

        $maxStockLevel = filled(
            $validated['max_stock_level'] ?? null
        )
            ? (float) $validated['max_stock_level']
            : null;

        if (
            $maxStockLevel !== null
            && $maxStockLevel < $reorderLevel
        ) {
            throw ValidationException::withMessages([
                'max_stock_level' => 'Maximum stock level must be equal to or greater than the reorder level.',
            ]);
        }

        $stock->update([
            'reorder_level' => $reorderLevel,
            'max_stock_level' => $maxStockLevel,
        ]);

        return back()->with(
            'success',
            'Stock settings updated successfully.'
        );
    }

    public function adjust(
        Request $request,
        WarehouseStock $stock
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureStockBelongsToTenant(
            $stock,
            $tenantId
        );

        $incomingTypes = [
            'stock_in',
            'adjustment_in',
            'return_in',
        ];

        $outgoingTypes = [
            'stock_out',
            'adjustment_out',
            'return_out',
            'damage',
            'expired',
        ];

        $allowedTypes = [
            ...$incomingTypes,
            ...$outgoingTypes,
        ];

        $validated = $request->validate([
            'movement_type' => [
                'required',
                Rule::in($allowedTypes),
            ],

            'quantity' => [
                'required',
                'numeric',
                'gt:0',
            ],

            'unit_cost' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'reference_no' => [
                'nullable',
                'string',
                'max:120',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        DB::connection('mysql')->transaction(
            function () use (
                $request,
                $tenantId,
                $stock,
                $validated,
                $incomingTypes
            ): void {
                $lockedStock = WarehouseStock::query()
                    ->where('tenant_id', $tenantId)
                    ->whereKey($stock->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $movementType = $validated[
                    'movement_type'
                ];

                $quantity = (float) $validated[
                    'quantity'
                ];

                $isIncoming = in_array(
                    $movementType,
                    $incomingTypes,
                    true
                );

                $quantityBefore = (float) $lockedStock
                    ->quantity;

                $quantityChange = $isIncoming
                    ? $quantity
                    : -$quantity;

                $quantityAfter = $quantityBefore
                    + $quantityChange;

                if ($quantityAfter < 0) {
                    throw ValidationException::withMessages([
                        'quantity' => 'The requested quantity is greater than the available stock.',
                    ]);
                }

                $unitCost = $isIncoming
                    ? (
                        filled(
                            $validated['unit_cost'] ?? null
                        )
                            ? (float) $validated['unit_cost']
                            : (
                                (float) $lockedStock
                                    ->average_cost > 0
                                    ? (float) $lockedStock
                                        ->average_cost
                                    : (float) $lockedStock
                                        ->product
                                        ->cost_price
                            )
                    )
                    : (float) $lockedStock->average_cost;

                $newAverageCost = (float) $lockedStock
                    ->average_cost;

                if ($isIncoming && $quantityAfter > 0) {
                    $currentValue = $quantityBefore
                        * (float) $lockedStock->average_cost;

                    $incomingValue = $quantity
                        * $unitCost;

                    $newAverageCost = (
                        $currentValue + $incomingValue
                    ) / $quantityAfter;
                }

                $movementDate = now();

                $lockedStock->update([
                    'quantity' => $quantityAfter,

                    'average_cost' => round(
                        $newAverageCost,
                        2
                    ),

                    'last_movement_at' => $movementDate,
                ]);

                StockMovement::query()->create([
                    'tenant_id' => $tenantId,

                    'warehouse_id' => $lockedStock
                        ->warehouse_id,

                    'product_id' => $lockedStock
                        ->product_id,

                    'movement_type' => $movementType,

                    'quantity' => $quantityChange,

                    'quantity_before' => $quantityBefore,

                    'quantity_after' => $quantityAfter,

                    'unit_cost' => $unitCost,

                    'total_cost' => round(
                        $quantity * $unitCost,
                        2
                    ),

                    'reference_type' => 'manual_adjustment',

                    'reference_id' => null,

                    'reference_no' => $this->nullableString(
                        $validated['reference_no'] ?? null
                    ) ?? $this->generateReferenceNumber(
                        'ADJ'
                    ),

                    'related_warehouse_id' => null,

                    'remarks' => $this->nullableString(
                        $validated['remarks'] ?? null
                    ),

                    'movement_date' => $movementDate,

                    'created_by' => $request->user()?->id,
                ]);
            }
        );

        return back()->with(
            'success',
            'Stock quantity updated successfully.'
        );
    }

    public function transfer(
        Request $request,
        WarehouseStock $stock
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureStockBelongsToTenant(
            $stock,
            $tenantId
        );

        $validated = $request->validate([
            'destination_warehouse_id' => [
                'required',
                'integer',
                'different:source_warehouse_id',

                Rule::exists('warehouses', 'id')
                    ->where(
                        fn ($query) => $query
                            ->where('tenant_id', $tenantId)
                            ->where('is_active', true)
                            ->whereNull('deleted_at')
                    ),
            ],

            'quantity' => [
                'required',
                'numeric',
                'gt:0',
            ],

            'remarks' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $destinationWarehouseId = (int) $validated[
            'destination_warehouse_id'
        ];

        if (
            $destinationWarehouseId
            === (int) $stock->warehouse_id
        ) {
            throw ValidationException::withMessages([
                'destination_warehouse_id' => 'The destination warehouse must be different from the source warehouse.',
            ]);
        }

        DB::connection('mysql')->transaction(
            function () use (
                $request,
                $tenantId,
                $stock,
                $validated,
                $destinationWarehouseId
            ): void {
                $sourceStock = WarehouseStock::query()
                    ->where('tenant_id', $tenantId)
                    ->whereKey($stock->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $quantity = (float) $validated[
                    'quantity'
                ];

                $sourceBefore = (float) $sourceStock
                    ->quantity;

                $sourceAfter = $sourceBefore - $quantity;

                if ($sourceAfter < 0) {
                    throw ValidationException::withMessages([
                        'quantity' => 'The transfer quantity is greater than the available stock.',
                    ]);
                }

                $destinationStock = WarehouseStock::query()
                    ->where('tenant_id', $tenantId)
                    ->where(
                        'warehouse_id',
                        $destinationWarehouseId
                    )
                    ->where(
                        'product_id',
                        $sourceStock->product_id
                    )
                    ->lockForUpdate()
                    ->first();

                if (! $destinationStock) {
                    $destinationStock = WarehouseStock::query()
                        ->create([
                            'tenant_id' => $tenantId,

                            'warehouse_id' => $destinationWarehouseId,

                            'product_id' => $sourceStock
                                ->product_id,

                            'quantity' => 0,

                            'reorder_level' => $sourceStock
                                ->reorder_level,

                            'max_stock_level' => $sourceStock
                                ->max_stock_level,

                            'average_cost' => $sourceStock
                                ->average_cost,

                            'last_movement_at' => null,
                        ]);
                }

                $destinationBefore = (float) $destinationStock
                    ->quantity;

                $destinationAfter = $destinationBefore
                    + $quantity;

                $unitCost = (float) $sourceStock
                    ->average_cost;

                $destinationAverageCost = $destinationAfter > 0
                    ? (
                        (
                            $destinationBefore
                            * (float) $destinationStock
                                ->average_cost
                        )
                        + ($quantity * $unitCost)
                    ) / $destinationAfter
                    : $unitCost;

                $movementDate = now();

                $referenceNumber =
                    $this->generateReferenceNumber(
                        'TRF'
                    );

                $sourceStock->update([
                    'quantity' => $sourceAfter,
                    'last_movement_at' => $movementDate,
                ]);

                $destinationStock->update([
                    'quantity' => $destinationAfter,

                    'average_cost' => round(
                        $destinationAverageCost,
                        2
                    ),

                    'last_movement_at' => $movementDate,
                ]);

                StockMovement::query()->create([
                    'tenant_id' => $tenantId,

                    'warehouse_id' => $sourceStock
                        ->warehouse_id,

                    'product_id' => $sourceStock
                        ->product_id,

                    'movement_type' => 'transfer_out',

                    'quantity' => -$quantity,

                    'quantity_before' => $sourceBefore,

                    'quantity_after' => $sourceAfter,

                    'unit_cost' => $unitCost,

                    'total_cost' => round(
                        $quantity * $unitCost,
                        2
                    ),

                    'reference_type' => 'warehouse_transfer',

                    'reference_id' => null,

                    'reference_no' => $referenceNumber,

                    'related_warehouse_id' => $destinationWarehouseId,

                    'remarks' => $this->nullableString(
                        $validated['remarks'] ?? null
                    ),

                    'movement_date' => $movementDate,

                    'created_by' => $request->user()?->id,
                ]);

                StockMovement::query()->create([
                    'tenant_id' => $tenantId,

                    'warehouse_id' => $destinationWarehouseId,

                    'product_id' => $sourceStock
                        ->product_id,

                    'movement_type' => 'transfer_in',

                    'quantity' => $quantity,

                    'quantity_before' => $destinationBefore,

                    'quantity_after' => $destinationAfter,

                    'unit_cost' => $unitCost,

                    'total_cost' => round(
                        $quantity * $unitCost,
                        2
                    ),

                    'reference_type' => 'warehouse_transfer',

                    'reference_id' => null,

                    'reference_no' => $referenceNumber,

                    'related_warehouse_id' => $sourceStock
                        ->warehouse_id,

                    'remarks' => $this->nullableString(
                        $validated['remarks'] ?? null
                    ),

                    'movement_date' => $movementDate,

                    'created_by' => $request->user()?->id,
                ]);
            }
        );

        return back()->with(
            'success',
            'Stock transferred successfully.'
        );
    }

    public function destroy(
        Request $request,
        WarehouseStock $stock
    ): RedirectResponse {
        $tenantId = $this->getTenantId($request);

        $this->ensureStockBelongsToTenant(
            $stock,
            $tenantId
        );

        if ((float) $stock->quantity !== 0.0) {
            return back()->with(
                'error',
                'The stock record cannot be deleted while it has an existing quantity.'
            );
        }

        $hasMovementHistory = StockMovement::query()
            ->where('tenant_id', $tenantId)
            ->where(
                'warehouse_id',
                $stock->warehouse_id
            )
            ->where(
                'product_id',
                $stock->product_id
            )
            ->exists();

        if ($hasMovementHistory) {
            return back()->with(
                'error',
                'The stock record cannot be deleted because it has movement history.'
            );
        }

        $stock->delete();

        return back()->with(
            'success',
            'Stock record deleted successfully.'
        );
    }

    private function getTenantId(
        Request $request
    ): int {
        $tenantId = (int) (
            $request->user()?->client_id ?? 0
        );

        if (
            $tenantId <= 0
            && app()->environment('local')
        ) {
            return 1;
        }

        abort_if(
            $tenantId <= 0,
            403,
            'Your account is not assigned to a client.'
        );

        return $tenantId;
    }

    private function ensureStockBelongsToTenant(
        WarehouseStock $stock,
        int $tenantId
    ): void {
        abort_unless(
            (int) $stock->tenant_id === $tenantId,
            404
        );
    }

    private function generateReferenceNumber(
        string $prefix
    ): string {
        return sprintf(
            '%s-%s-%s',
            Str::upper($prefix),
            now()->format('YmdHis'),
            Str::upper(Str::random(6))
        );
    }

    private function nullableString(
        mixed $value
    ): ?string {
        $value = trim((string) $value);

        return $value !== ''
            ? $value
            : null;
    }
}