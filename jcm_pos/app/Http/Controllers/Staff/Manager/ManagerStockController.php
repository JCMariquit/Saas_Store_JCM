<?php

namespace App\Http\Controllers\Staff\Manager;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Product;
use App\Models\ProductStockBatch;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ManagerStockController extends Controller
{
    private function managerBranch(): Branch
    {
        $user = auth()->user();

        abort_if(!$user->branch_id, 403, 'No branch assigned to this manager.');

        return Branch::query()
            ->where('id', $user->branch_id)
            ->where('tenant_id', $user->client_id)
            ->where('is_active', true)
            ->firstOrFail(['id', 'tenant_id', 'name', 'code', 'is_main', 'is_active']);
    }

    public function index(Request $request)
    {
        $branch = $this->managerBranch();
        $filters = $this->filters($request);

        $products = Product::query()
            ->with(['category:id,name'])
            ->where('tenant_id', $branch->tenant_id)
            ->where('branch_id', $branch->id)
            ->where('stock_tracking', 'tracked')
            ->when($filters['search'], function ($query, $search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->when($filters['stock_status'], fn ($query, $status) => $this->applyStockStatus($query, $status))
            ->orderByRaw("
                CASE
                    WHEN quantity <= 0 THEN 0
                    WHEN quantity <= reorder_level THEN 1
                    ELSE 2
                END
            ")
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $movements = StockMovement::query()
            ->with(['product:id,name,sku,barcode'])
            ->where('tenant_id', $branch->tenant_id)
            ->where('branch_id', $branch->id)
            ->latest('movement_date')
            ->limit(10)
            ->get();

        return Inertia::render('staff/manager/stocks/index', [
            'products' => $products,
            'branch' => $branch,
            'movements' => $movements,
            'filters' => $filters,
        ]);
    }

    public function adjust(Request $request)
    {
        $branch = $this->managerBranch();

        $validated = $request->validate($this->adjustRules(
            (int) $branch->tenant_id,
            (int) $branch->id
        ));

        DB::connection('pos')->transaction(function () use ($validated, $branch) {
            $tenantId = (int) $branch->tenant_id;
            $branchId = (int) $branch->id;

            $product = Product::query()
                ->where('tenant_id', $tenantId)
                ->where('branch_id', $branchId)
                ->where('stock_tracking', 'tracked')
                ->lockForUpdate()
                ->findOrFail($validated['product_id']);

            $quantity = (float) $validated['quantity'];
            $quantityBefore = (float) $product->quantity;
            $unitCost = (float) ($validated['unit_cost'] ?? $product->cost_price ?? 0);
            $batchId = null;

            if ($validated['movement_type'] === 'stock_in') {
                $quantityAfter = $quantityBefore + $quantity;
                $batchId = $this->createStockInBatch($product, $tenantId, $branchId, $quantity, $unitCost, $validated['remarks'] ?? null);
            } elseif ($validated['movement_type'] === 'stock_out') {
                abort_if($quantity > $quantityBefore, 422, 'Stock out quantity cannot exceed current stock.');

                $quantityAfter = $quantityBefore - $quantity;
                $this->consumeBatches($tenantId, $branchId, $product->id, $quantity);
            } else {
                $quantityAfter = $quantity;
            }

            $product->update([
                'quantity' => $quantityAfter,
                'cost_price' => $validated['movement_type'] === 'stock_in' ? $unitCost : $product->cost_price,
            ]);

            StockMovement::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'product_id' => $product->id,
                'product_stock_batch_id' => $batchId,
                'movement_type' => $validated['movement_type'],
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'total_cost' => $quantity * $unitCost,
                'quantity_before' => $quantityBefore,
                'quantity_after' => $quantityAfter,
                'remarks' => $validated['remarks'] ?? null,
                'movement_date' => now(),
                'created_by' => auth()->id(),
            ]);
        });

        return back()->with('success', 'Stock updated successfully.');
    }

    private function createStockInBatch(Product $product, int $tenantId, int $branchId, float $quantity, float $unitCost, ?string $remarks): int
    {
        $batch = ProductStockBatch::create([
            'tenant_id' => $tenantId,
            'branch_id' => $branchId,
            'product_id' => $product->id,
            'batch_no' => 'BATCH-' . now()->format('YmdHis') . '-' . $product->id,
            'quantity_received' => $quantity,
            'quantity_remaining' => $quantity,
            'unit_cost' => $unitCost,
            'selling_price' => $product->selling_price,
            'received_date' => now()->toDateString(),
            'expiry_date' => null,
            'remarks' => $remarks ?? 'Stock in by manager',
        ]);

        return (int) $batch->id;
    }

    private function consumeBatches(int $tenantId, int $branchId, int $productId, float $quantity): void
    {
        $remainingToConsume = $quantity;

        $batches = ProductStockBatch::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('product_id', $productId)
            ->where('quantity_remaining', '>', 0)
            ->orderBy('received_date')
            ->orderBy('id')
            ->lockForUpdate()
            ->get();

        foreach ($batches as $batch) {
            if ($remainingToConsume <= 0) {
                break;
            }

            $batchRemaining = (float) $batch->quantity_remaining;
            $consume = min($batchRemaining, $remainingToConsume);

            $batch->update([
                'quantity_remaining' => $batchRemaining - $consume,
            ]);

            $remainingToConsume -= $consume;
        }
    }

    private function applyStockStatus($query, string $status): void
    {
        if ($status === 'in_stock') {
            $query->where('quantity', '>', 0)
                ->whereColumn('quantity', '>', 'reorder_level');
        }

        if ($status === 'low_stock') {
            $query->whereColumn('quantity', '<=', 'reorder_level')
                ->where('quantity', '>', 0);
        }

        if ($status === 'out_of_stock') {
            $query->where('quantity', '<=', 0);
        }
    }

    private function filters(Request $request): array
    {
        return [
            'search' => trim((string) $request->input('search', '')),
            'stock_status' => $request->input('stock_status'),
        ];
    }

    private function adjustRules(int $tenantId, int $branchId): array
    {
        return [
            'product_id' => [
                'required',
                'integer',
                Rule::exists('pos.products', 'id')->where(fn ($query) => $query
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->where('stock_tracking', 'tracked')),
            ],
            'movement_type' => ['required', 'in:stock_in,stock_out,adjustment'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'remarks' => ['nullable', 'string'],
        ];
    }
}