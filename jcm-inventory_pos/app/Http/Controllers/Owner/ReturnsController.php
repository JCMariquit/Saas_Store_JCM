<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Product;
use App\Models\ReturnItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ReturnsController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = auth()->user()->tenantId();

        $search = $request->input('search');
        $branchId = $request->input('branch_id');

        $branches = Branch::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'is_main']);

        $returns = ReturnItem::query()
            ->from('return_items as ri')
            ->join('sales as s', 's.id', '=', 'ri.sale_id')
            ->leftJoin('branches as b', 'b.id', '=', 'ri.branch_id')
            ->where('ri.tenant_id', $tenantId)
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('ri.return_no', 'like', "%{$search}%")
                        ->orWhere('s.sale_no', 'like', "%{$search}%")
                        ->orWhere('ri.product_name', 'like', "%{$search}%")
                        ->orWhere('ri.sku', 'like', "%{$search}%");
                });
            })
            ->when($branchId, fn ($query) => $query->where('ri.branch_id', $branchId))
            ->select([
                'ri.*',
                's.sale_no',
                'b.name as branch_name',
                'b.code as branch_code',
            ])
            ->latest('ri.returned_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('owner/sales/returns/index', [
            'returns' => $returns,
            'branches' => $branches,
            'filters' => [
                'search' => $search,
                'branch_id' => $branchId,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = auth()->user()->tenantId();

        $validated = $request->validate([
            'sale_item_id' => ['required', 'integer'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        DB::connection('pos')->transaction(function () use ($validated, $tenantId) {
            $saleItem = SaleItem::query()
                ->where('tenant_id', $tenantId)
                ->where('id', $validated['sale_item_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $sale = Sale::query()
                ->where('tenant_id', $tenantId)
                ->where('id', $saleItem->sale_id)
                ->lockForUpdate()
                ->firstOrFail();

            $branchId = $saleItem->branch_id ?? $sale->branch_id;

            $returnQty = (float) $validated['quantity'];
            $currentQty = (float) $saleItem->quantity;

            if ($returnQty > $currentQty) {
                throw ValidationException::withMessages([
                    'quantity' => "Return quantity cannot exceed current sold quantity ({$currentQty}).",
                ]);
            }

            $unitPrice = (float) $saleItem->unit_price;
            $unitCost = (float) $saleItem->unit_cost;
            $returnAmount = round($returnQty * $unitPrice, 2);

            ReturnItem::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'sale_id' => $sale->id,
                'sale_item_id' => $saleItem->id,
                'product_id' => $saleItem->product_id,
                'product_name' => $saleItem->product_name,
                'sku' => $saleItem->sku,
                'return_no' => $this->generateReturnNo($tenantId),
                'quantity' => $returnQty,
                'unit_price' => $unitPrice,
                'line_total' => $returnAmount,
                'reason' => $validated['reason'] ?? null,
                'status' => 'completed',
                'returned_by' => auth()->id(),
                'returned_at' => now(),
            ]);

            $newQty = round($currentQty - $returnQty, 2);
            $newLineTotal = round($newQty * $unitPrice, 2);

            $saleItem->update([
                'quantity' => $newQty,
                'line_total' => $newLineTotal,
            ]);

            $newSubtotal = max(0, round((float) $sale->subtotal - $returnAmount, 2));
            $newGrandTotal = max(0, round((float) $sale->grand_total - $returnAmount, 2));
            $newAmountPaid = max(0, round((float) $sale->amount_paid - $returnAmount, 2));

            $sale->update([
                'subtotal' => $newSubtotal,
                'grand_total' => $newGrandTotal,
                'amount_paid' => $newAmountPaid,
                'change_amount' => max(0, round($newAmountPaid - $newGrandTotal, 2)),
                'status' => 'completed',
            ]);

            $product = Product::query()
                ->where('tenant_id', $tenantId)
                ->where('id', $saleItem->product_id)
                ->lockForUpdate()
                ->first();

            if ($product && $product->stock_tracking === 'tracked') {
                $before = (float) $product->quantity;
                $after = round($before + $returnQty, 2);

                $product->update([
                    'quantity' => $after,
                ]);

                StockMovement::create([
                    'tenant_id' => $tenantId,
                    'branch_id' => $branchId,
                    'product_id' => $product->id,
                    'product_stock_batch_id' => null,
                    'movement_type' => 'return_in',
                    'quantity' => $returnQty,
                    'unit_cost' => $unitCost,
                    'total_cost' => round($returnQty * $unitCost, 2),
                    'quantity_before' => $before,
                    'quantity_after' => $after,
                    'remarks' => 'POS return: ' . $sale->sale_no,
                    'movement_date' => now(),
                    'created_by' => auth()->id(),
                ]);
            }
        });

        return back()->with('success', 'Return saved successfully.');
    }

    public function searchSale(Request $request)
    {
        $tenantId = auth()->user()->tenantId();
        $saleNo = $request->input('sale_no');

        if (! $saleNo) {
            return response()->json([
                'sale' => null,
                'items' => [],
            ]);
        }

        $sale = Sale::query()
            ->where('tenant_id', $tenantId)
            ->where('sale_no', $saleNo)
            ->first();

        if (! $sale) {
            return response()->json([
                'sale' => null,
                'items' => [],
            ]);
        }

        $items = SaleItem::query()
            ->where('tenant_id', $tenantId)
            ->where('sale_id', $sale->id)
            ->where('quantity', '>', 0)
            ->get([
                'id',
                'sale_id',
                'product_id',
                'product_name',
                'sku',
                'quantity',
                'unit_price',
                'line_total',
            ]);

        return response()->json([
            'sale' => $sale,
            'items' => $items,
        ]);
    }

    private function generateReturnNo(int $tenantId): string
    {
        $prefix = 'RET-' . now()->format('Ymd') . '-';

        $latest = ReturnItem::query()
            ->where('tenant_id', $tenantId)
            ->where('return_no', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->value('return_no');

        $nextNumber = 1;

        if ($latest) {
            $nextNumber = ((int) str_replace($prefix, '', $latest)) + 1;
        }

        return $prefix . str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT);
    }
}