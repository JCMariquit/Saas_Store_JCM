<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ReturnItem;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CashierReturnController extends Controller
{
    private function tenantId(): int
    {
        return (int) auth()->user()->client_id;
    }

    private function branchId(): int
    {
        $branchId = (int) auth()->user()->branch_id;

        abort_if(!$branchId, 403, 'No branch assigned to this cashier.');

        return $branchId;
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantId();
        $branchId = $this->branchId();
        $cashierId = (int) auth()->id();

        $search = $request->input('search');

        $returns = ReturnItem::query()
            ->from('return_items as ri')
            ->join('sales as s', 's.id', '=', 'ri.sale_id')
            ->leftJoin('sale_items as si', 'si.id', '=', 'ri.sale_item_id')
            ->leftJoin('products as p', 'p.id', '=', 'ri.product_id')
            ->where('ri.tenant_id', $tenantId)
            ->where('ri.branch_id', $branchId)
            ->where('ri.returned_by', $cashierId)
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('ri.return_no', 'like', "%{$search}%")
                        ->orWhere('s.sale_no', 'like', "%{$search}%")
                        ->orWhere('si.product_name', 'like', "%{$search}%")
                        ->orWhere('si.sku', 'like', "%{$search}%")
                        ->orWhere('p.name', 'like', "%{$search}%")
                        ->orWhere('p.sku', 'like', "%{$search}%");
                });
            })
            ->select([
                'ri.*',
                's.sale_no',
                DB::raw('COALESCE(si.product_name, p.name) as product_name'),
                DB::raw('COALESCE(si.sku, p.sku) as sku'),
            ])
            ->latest('ri.returned_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('staff/cashier/returns/index', [
            'returns' => $returns,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $tenantId = $this->tenantId();
        $branchId = $this->branchId();
        $cashierId = (int) auth()->id();

        $validated = $request->validate([
            'sale_item_id' => ['required', 'integer'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        DB::connection('pos')->transaction(function () use ($validated, $tenantId, $branchId, $cashierId) {
            $saleItem = SaleItem::query()
                ->where('tenant_id', $tenantId)
                ->where('branch_id', $branchId)
                ->where('id', $validated['sale_item_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $sale = Sale::query()
                ->where('tenant_id', $tenantId)
                ->where('branch_id', $branchId)
                ->where('id', $saleItem->sale_id)
                ->where('cashier_user_id', $cashierId)
                ->lockForUpdate()
                ->firstOrFail();

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

            $return = ReturnItem::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'sale_id' => $sale->id,
                'sale_item_id' => $saleItem->id,
                'product_id' => $saleItem->product_id,
                'return_no' => $this->generateReturnNo($tenantId),
                'quantity' => $returnQty,
                'unit_price' => $unitPrice,
                'line_total' => $returnAmount,
                'reason' => $validated['reason'] ?? null,
                'status' => 'completed',
                'returned_by' => $cashierId,
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
                'status' => $newGrandTotal <= 0 ? 'refunded' : 'completed',
            ]);

            $product = Product::query()
                ->where('tenant_id', $tenantId)
                ->where('branch_id', $branchId)
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
                    'reference_type' => ReturnItem::class,
                    'reference_id' => $return->id,
                    'remarks' => 'Cashier POS return: ' . $sale->sale_no,
                    'movement_date' => now(),
                    'created_by' => $cashierId,
                ]);
            }

            ActivityLogger::log(
                module: 'cashier_returns',
                action: 'created',
                description: "Cashier created return {$return->return_no}.",
                properties: [
                    'return_no' => $return->return_no,
                    'sale_no' => $sale->sale_no,
                    'return_amount' => $returnAmount,
                    'quantity' => $returnQty,
                ]
            );
        });

        return back()->with('success', 'Return saved successfully.');
    }

    public function searchSale(Request $request)
    {
        $tenantId = $this->tenantId();
        $branchId = $this->branchId();
        $cashierId = (int) auth()->id();

        $saleNo = $request->input('sale_no');

        if (! $saleNo) {
            return response()->json([
                'sale' => null,
                'items' => [],
            ]);
        }

        $sale = Sale::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('cashier_user_id', $cashierId)
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
            ->where('branch_id', $branchId)
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

        $nextNumber = $latest ? ((int) str_replace($prefix, '', $latest)) + 1 : 1;

        return $prefix . str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT);
    }
}