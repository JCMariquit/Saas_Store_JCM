<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use App\Models\Pos\Category;
use App\Models\Pos\Product;
use App\Models\Pos\ProductStockBatch;
use App\Models\Pos\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StocksController extends Controller
{
    private function tenantId(): int
    {
        return auth()->id();
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantId();

        $products = Product::query()
            ->with('category:id,name')
            ->where('tenant_id', $tenantId)
            ->where('stock_tracking', 'tracked')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;

                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category_id'), function ($query) use ($request) {
                $query->where('category_id', $request->category_id);
            })
            ->when($request->filled('stock_status'), function ($query) use ($request) {
                if ($request->stock_status === 'out') {
                    $query->where('quantity', '<=', 0);
                }

                if ($request->stock_status === 'low') {
                    $query->whereColumn('quantity', '<=', 'reorder_level')
                        ->where('quantity', '>', 0);
                }

                if ($request->stock_status === 'normal') {
                    $query->whereColumn('quantity', '>', 'reorder_level');
                }
            })
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $categories = Category::query()
            ->where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $summary = [
            'total_products' => Product::where('tenant_id', $tenantId)->where('stock_tracking', 'tracked')->count(),
            'low_stock' => Product::where('tenant_id', $tenantId)->where('stock_tracking', 'tracked')->whereColumn('quantity', '<=', 'reorder_level')->where('quantity', '>', 0)->count(),
            'out_of_stock' => Product::where('tenant_id', $tenantId)->where('stock_tracking', 'tracked')->where('quantity', '<=', 0)->count(),
            'inventory_value' => Product::where('tenant_id', $tenantId)->where('stock_tracking', 'tracked')->selectRaw('COALESCE(SUM(quantity * cost_price), 0) as total')->value('total'),
        ];

        return Inertia::render('owner/inventory/stocks/index', [
            'products' => $products,
            'categories' => $categories,
            'summary' => $summary,
            'filters' => [
                'search' => $request->search,
                'category_id' => $request->category_id,
                'stock_status' => $request->stock_status,
            ],
        ]);
    }

    public function adjust(Request $request)
    {
        $tenantId = $this->tenantId();

        $validated = $request->validate([
            'product_id' => ['required', 'integer'],
            'movement_type' => ['required', 'in:stock_in,adjustment_in,adjustment_out,damage,expired'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'unit_cost' => ['nullable', 'numeric', 'min:0'],
            'remarks' => ['nullable', 'string'],
            'received_date' => ['nullable', 'date'],
            'expiry_date' => ['nullable', 'date'],
        ]);

        DB::connection('pos')->transaction(function () use ($validated, $tenantId) {
            $product = Product::where('tenant_id', $tenantId)
                ->where('id', $validated['product_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $quantity = (float) $validated['quantity'];
            $unitCost = (float) ($validated['unit_cost'] ?? $product->cost_price ?? 0);
            $before = (float) $product->quantity;

            $increaseTypes = ['stock_in', 'adjustment_in'];
            $isIncrease = in_array($validated['movement_type'], $increaseTypes, true);

            $after = $isIncrease
                ? $before + $quantity
                : $before - $quantity;

            if ($after < 0) {
                abort(422, 'Stock quantity cannot be negative.');
            }

            $batchId = null;

            if ($validated['movement_type'] === 'stock_in') {
                $batch = ProductStockBatch::create([
                    'tenant_id' => $tenantId,
                    'product_id' => $product->id,
                    'batch_no' => 'BATCH-' . now()->format('YmdHis') . '-' . $product->id,
                    'quantity_received' => $quantity,
                    'quantity_remaining' => $quantity,
                    'unit_cost' => $unitCost,
                    'selling_price' => $product->selling_price,
                    'received_date' => $validated['received_date'] ?? now()->toDateString(),
                    'expiry_date' => $validated['expiry_date'] ?? null,
                    'remarks' => $validated['remarks'] ?? 'Stock in',
                ]);

                $batchId = $batch->id;
            }

            $product->update([
                'quantity' => $after,
                'cost_price' => $unitCost,
            ]);

            StockMovement::create([
                'tenant_id' => $tenantId,
                'product_id' => $product->id,
                'product_stock_batch_id' => $batchId,
                'movement_type' => $validated['movement_type'],
                'quantity' => $quantity,
                'unit_cost' => $unitCost,
                'total_cost' => $quantity * $unitCost,
                'quantity_before' => $before,
                'quantity_after' => $after,
                'remarks' => $validated['remarks'] ?? null,
                'movement_date' => now(),
                'created_by' => auth()->id(),
            ]);
        });

        return back()->with('success', 'Stock updated successfully.');
    }
}