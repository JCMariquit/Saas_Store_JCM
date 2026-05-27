<?php

namespace App\Http\Controllers\Shared;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PosTerminalController extends Controller
{
    private function tenantId(): int
    {
        $user = auth()->user();

        return (int) ($user->client_id ?: $user->id);
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantId();

        $products = Product::query()
            ->with('category:id,name')
            ->where('tenant_id', $tenantId)
            ->where('status', 'active')
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
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('shared/terminal/index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $request->search,
                'category_id' => $request->category_id,
                'stock_status' => $request->stock_status,
            ],
            'cashier' => [
                'id' => auth()->id(),
                'name' => auth()->user()?->name ?? 'Cashier',
            ],
        ]);
    }

    public function checkout(Request $request)
    {
        $tenantId = $this->tenantId();

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['required', 'in:cash,gcash,card,bank_transfer'],
            'amount_paid' => ['required', 'numeric', 'min:0'],
            'reference_no' => ['nullable', 'string', 'max:150'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);

        $sale = DB::connection('pos')->transaction(function () use ($validated, $tenantId) {
            $items = collect($validated['items'])
                ->groupBy('product_id')
                ->map(function ($rows, $productId) {
                    return [
                        'product_id' => (int) $productId,
                        'quantity' => (float) collect($rows)->sum('quantity'),
                    ];
                })
                ->values();

            $subtotal = 0;
            $preparedItems = [];

            foreach ($items as $item) {
                $product = Product::where('tenant_id', $tenantId)
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
            $grandTotal = $subtotal;
            $amountPaid = round((float) $validated['amount_paid'], 2);

            if ($amountPaid < $grandTotal) {
                abort(422, 'Amount paid is less than the total.');
            }

            $sale = Sale::create([
                'tenant_id' => $tenantId,
                'sale_no' => $this->generateSaleNo(),
                'cashier_user_id' => auth()->id(),
                'subtotal' => $subtotal,
                'discount_total' => 0,
                'tax_total' => 0,
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
                $after = $before;

                SaleItem::create([
                    'tenant_id' => $tenantId,
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'unit_cost' => $item['unit_cost'],
                    'discount_amount' => 0,
                    'line_total' => $item['line_total'],
                ]);

                if ($product->stock_tracking === 'tracked') {
                    $after = round($before - $item['quantity'], 2);

                    $product->update([
                        'quantity' => $after,
                    ]);

                    StockMovement::create([
                        'tenant_id' => $tenantId,
                        'product_id' => $product->id,
                        'product_stock_batch_id' => null,
                        'movement_type' => 'sale',
                        'quantity' => $item['quantity'],
                        'unit_cost' => $item['unit_cost'],
                        'total_cost' => round($item['quantity'] * $item['unit_cost'], 2),
                        'quantity_before' => $before,
                        'quantity_after' => $after,
                        'remarks' => 'POS sale: ' . $sale->sale_no,
                        'movement_date' => now(),
                        'created_by' => auth()->id(),
                    ]);
                }
            }

            Payment::create([
                'tenant_id' => $tenantId,
                'sale_id' => $sale->id,
                'method' => $validated['payment_method'],
                'amount' => $amountPaid,
                'reference_no' => $validated['reference_no'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
            ]);

            return $sale->load(['items', 'payments']);
        });

        return back()->with([
            'success' => 'Sale completed successfully.',
            'sale_id' => $sale->id,
            'sale_no' => $sale->sale_no,
        ]);
    }

    private function generateSaleNo(): string
    {
        $prefix = 'SALE-' . now()->format('Ymd') . '-';

        $latest = Sale::where('tenant_id', $this->tenantId())
            ->where('sale_no', 'like', $prefix . '%')
            ->orderByDesc('id')
            ->value('sale_no');

        $nextNumber = 1;

        if ($latest) {
            $nextNumber = ((int) str_replace($prefix, '', $latest)) + 1;
        }

        return $prefix . str_pad((string) $nextNumber, 5, '0', STR_PAD_LEFT);
    }
}