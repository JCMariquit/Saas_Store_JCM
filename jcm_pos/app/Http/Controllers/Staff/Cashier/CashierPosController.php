<?php

namespace App\Http\Controllers\Staff\Cashier;

use App\Http\Controllers\Controller;
use App\Models\CashDrawer;
use App\Models\CashDrawerTransaction;
use App\Models\Category;
use App\Models\Discount;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CashierPosController extends Controller
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

        $products = Product::query()
            ->with('category:id,name')
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('status', 'active')
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = $request->search;

                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('category_id'), fn ($query) => $query->where('category_id', $request->category_id))
            ->when($request->filled('stock_status'), function ($query) use ($request) {
                if ($request->stock_status === 'in_stock') {
                    $query->where(function ($q) {
                        $q->where('stock_tracking', 'not_tracked')
                            ->orWhere('quantity', '>', 0);
                    });
                }

                if ($request->stock_status === 'out_of_stock') {
                    $query->where('stock_tracking', 'tracked')
                        ->where('quantity', '<=', 0);
                }
            })
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        $categories = Category::query()
            ->where('tenant_id', $tenantId)
            ->where('branch_id', $branchId)
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        $discounts = Discount::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where(function ($query) use ($branchId) {
                $query->whereNull('branch_id')
                    ->orWhere('branch_id', $branchId);
            })
            ->where(function ($query) {
                $query->whereNull('starts_at')
                    ->orWhere('starts_at', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>=', now());
            })
            ->orderByRaw('branch_id IS NULL DESC')
            ->orderBy('name')
            ->get([
                'id',
                'branch_id',
                'name',
                'code',
                'type',
                'value',
                'min_purchase',
                'max_discount',
                'starts_at',
                'ends_at',
            ]);

        return Inertia::render('staff/cashier/pos/terminal', [
            'products' => $products,
            'categories' => $categories,
            'discounts' => $discounts,
            'selected_branch_id' => $branchId,
            'filters' => [
                'search' => $request->search,
                'category_id' => $request->category_id,
                'stock_status' => $request->stock_status,
                'branch_id' => $branchId,
            ],
            'cashier' => [
                'id' => Auth::id(),
                'name' => Auth::user()?->name ?? 'Cashier',
            ],
        ]);
    }

    public function checkout(Request $request)
    {
        $tenantId = $this->tenantId();
        $branchId = $this->branchId();

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'discount_id' => ['nullable', 'integer'],
            'payment_method' => ['required', 'in:cash,gcash,card,bank_transfer'],
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'reference_no' => ['nullable', 'string', 'max:150'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $sale = DB::connection('pos')->transaction(function () use ($validated, $tenantId, $branchId) {
            $items = collect($validated['items'])
                ->groupBy('product_id')
                ->map(fn ($rows, $productId) => [
                    'product_id' => (int) $productId,
                    'quantity' => (float) collect($rows)->sum('quantity'),
                ])
                ->values();

            $subtotal = 0;
            $preparedItems = [];

            foreach ($items as $item) {
                $product = Product::query()
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->where('id', $item['product_id'])
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($product->status !== 'active') {
                    abort(422, "{$product->name} is not active.");
                }

                $qty = (float) $item['quantity'];

                if ($product->stock_tracking === 'tracked' && (float) $product->quantity < $qty) {
                    abort(422, "Insufficient stock for {$product->name}. Available: {$product->quantity}");
                }

                $unitPrice = (float) $product->selling_price;
                $unitCost = (float) $product->cost_price;
                $lineTotal = round($qty * $unitPrice, 2);

                $subtotal += $lineTotal;

                $preparedItems[] = [
                    'product' => $product,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'unit_cost' => $unitCost,
                    'line_total' => $lineTotal,
                ];
            }

            $subtotal = round($subtotal, 2);

            $discount = null;
            $discountTotal = 0;

            if (!empty($validated['discount_id'])) {
                $discount = Discount::query()
                    ->where('tenant_id', $tenantId)
                    ->where('id', $validated['discount_id'])
                    ->where('is_active', true)
                    ->where(function ($query) use ($branchId) {
                        $query->whereNull('branch_id')
                            ->orWhere('branch_id', $branchId);
                    })
                    ->where(function ($query) {
                        $query->whereNull('starts_at')
                            ->orWhere('starts_at', '<=', now());
                    })
                    ->where(function ($query) {
                        $query->whereNull('ends_at')
                            ->orWhere('ends_at', '>=', now());
                    })
                    ->first();

                if (!$discount) {
                    abort(422, 'Selected discount is not valid or inactive.');
                }

                if ($subtotal < (float) $discount->min_purchase) {
                    abort(422, 'Subtotal does not meet the minimum purchase for this discount.');
                }

                if ($discount->type === 'percent') {
                    $discountTotal = round($subtotal * ((float) $discount->value / 100), 2);

                    if ($discount->max_discount !== null) {
                        $discountTotal = min($discountTotal, round((float) $discount->max_discount, 2));
                    }
                } else {
                    $discountTotal = round((float) $discount->value, 2);
                }

                $discountTotal = min($discountTotal, $subtotal);
            }

            $taxTotal = 0;
            $grandTotal = round($subtotal - $discountTotal + $taxTotal, 2);
            $amountPaid = round((float) $validated['amount_paid'], 2);

            if ($amountPaid < $grandTotal) {
                abort(422, 'Amount paid is less than the total.');
            }

            $sale = Sale::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'sale_no' => $this->generateSaleNo($branchId),
                'cashier_user_id' => Auth::id(),

                'discount_id' => $discount?->id,
                'discount_name' => $discount?->name,
                'discount_code' => $discount?->code,
                'discount_type' => $discount?->type,
                'discount_value' => $discount?->value,

                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'tax_total' => $taxTotal,
                'grand_total' => $grandTotal,
                'amount_paid' => $amountPaid,
                'change_amount' => round($amountPaid - $grandTotal, 2),
                'payment_status' => 'paid',
                'status' => 'completed',
                'remarks' => $validated['remarks'] ?? null,
                'sold_at' => now(),
            ]);

            foreach ($preparedItems as $item) {
                $product = $item['product'];
                $before = (float) $product->quantity;

                $itemDiscount = 0;

                if ($subtotal > 0 && $discountTotal > 0) {
                    $itemDiscount = round(($item['line_total'] / $subtotal) * $discountTotal, 2);
                }

                SaleItem::create([
                    'tenant_id' => $tenantId,
                    'branch_id' => $branchId,
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'unit_cost' => $item['unit_cost'],
                    'discount_amount' => $itemDiscount,
                    'line_total' => $item['line_total'],
                ]);

                if ($product->stock_tracking === 'tracked') {
                    $after = round($before - $item['quantity'], 2);

                    $product->update([
                        'quantity' => $after,
                    ]);

                    StockMovement::create([
                        'tenant_id' => $tenantId,
                        'branch_id' => $branchId,
                        'product_id' => $product->id,
                        'product_stock_batch_id' => null,
                        'movement_type' => 'sale',
                        'quantity' => $item['quantity'],
                        'unit_cost' => $item['unit_cost'],
                        'total_cost' => round($item['quantity'] * $item['unit_cost'], 2),
                        'quantity_before' => $before,
                        'quantity_after' => $after,
                        'reference_type' => Sale::class,
                        'reference_id' => $sale->id,
                        'remarks' => 'POS sale: ' . $sale->sale_no,
                        'movement_date' => now(),
                        'created_by' => Auth::id(),
                    ]);
                }
            }

            Payment::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'sale_id' => $sale->id,
                'method' => $validated['payment_method'],
                'amount' => $amountPaid,
                'reference_no' => $validated['reference_no'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            if ($validated['payment_method'] === 'cash') {
                $cashDrawer = CashDrawer::query()
                    ->where('tenant_id', $tenantId)
                    ->where('branch_id', $branchId)
                    ->where('status', 'open')
                    ->latest('opened_at')
                    ->lockForUpdate()
                    ->first();

                if (!$cashDrawer) {
                    $cashDrawer = CashDrawer::create([
                        'tenant_id' => $tenantId,
                        'branch_id' => $branchId,
                        'opened_by' => Auth::id(),
                        'opening_balance' => 0,
                        'expected_balance' => 0,
                        'actual_balance' => null,
                        'variance_amount' => null,
                        'total_cash_sales' => 0,
                        'total_refunds' => 0,
                        'total_cash_in' => 0,
                        'total_cash_out' => 0,
                        'status' => 'open',
                        'opened_at' => now(),
                        'closed_at' => null,
                        'notes' => 'DEV AUTO OPEN FROM CASHIER POS CHECKOUT',
                    ]);
                }

                CashDrawerTransaction::create([
                    'tenant_id' => $tenantId,
                    'cash_drawer_id' => $cashDrawer->id,
                    'type' => 'cash_sale',
                    'amount' => $grandTotal,
                    'reference_type' => 'sale',
                    'reference_id' => $sale->id,
                    'remarks' => 'Cashier POS cash sale: ' . $sale->sale_no,
                    'created_by' => Auth::id(),
                ]);

                $cashDrawer->update([
                    'total_cash_sales' => round((float) $cashDrawer->total_cash_sales + $grandTotal, 2),
                    'expected_balance' => round((float) $cashDrawer->expected_balance + $grandTotal, 2),
                ]);
            }

            ActivityLogger::log(
                module: 'cashier_pos',
                action: 'checkout',
                description: "Cashier completed POS sale {$sale->sale_no}.",
                properties: [
                    'sale_no' => $sale->sale_no,
                    'sale_id' => $sale->id,
                    'grand_total' => $sale->grand_total,
                    'payment_method' => $validated['payment_method'],
                    'items_count' => count($preparedItems),
                ]
            );

            return $sale->load(['items', 'payments']);
        });

        return back()->with([
            'success' => 'Sale completed successfully.',
            'sale_id' => $sale->id,
            'sale_no' => $sale->sale_no,
            'discount_total' => $sale->discount_total,
            'grand_total' => $sale->grand_total,
        ]);
    }

    private function generateSaleNo(?int $branchId = null): string
    {
        $prefix = 'SALE-' . now()->format('Ymd') . '-';

        $latest = Sale::query()
            ->where('tenant_id', $this->tenantId())
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
            ->where('sale_no', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->value('sale_no');

        $nextNumber = $latest ? ((int) str_replace($prefix, '', $latest)) + 1 : 1;

        return $prefix . str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT);
    }
}