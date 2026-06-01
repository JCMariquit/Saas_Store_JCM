<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\CashDrawer;
use App\Models\CashDrawerTransaction;
use App\Models\Category;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PosTerminalController extends Controller
{
    private function tenantId(): int
    {
        $user = Auth::user();

        return (int) ($user->client_id ?: $user->id);
    }

    private function branchId(?int $requestedBranchId = null): int
    {
        $tenantId = $this->tenantId();

        if ($requestedBranchId) {
            $branchId = Branch::query()
                ->where('tenant_id', $tenantId)
                ->where('id', $requestedBranchId)
                ->where('is_active', true)
                ->value('id');

            if ($branchId) {
                return (int) $branchId;
            }
        }

        return (int) Branch::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('id')
            ->value('id');
    }

    public function index(Request $request)
    {
        $tenantId = $this->tenantId();
        $branchId = $this->branchId((int) ($request->branch_id ?? 0));

        $branches = Branch::query()
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderByDesc('is_main')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'is_main']);

        $products = Product::query()
            ->with('category:id,name')
            ->where('tenant_id', $tenantId)
            ->when($branchId, fn ($query) => $query->where('branch_id', $branchId))
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
                    $query->where('stock_tracking', 'tracked')->where('quantity', '<=', 0);
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

        return Inertia::render('owner/terminal/index', [
            'products' => $products,
            'categories' => $categories,
            'branches' => $branches,
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
        $branchId = $this->branchId((int) ($request->branch_id ?? 0));

        if (!$branchId) {
            abort(422, 'No active branch found. Please create or activate a branch first.');
        }

        $validated = $request->validate([
            'branch_id' => ['nullable', 'integer'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
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
            $grandTotal = $subtotal;
            $amountPaid = round((float) $validated['amount_paid'], 2);

            if ($amountPaid < $grandTotal) {
                abort(422, 'Amount paid is less than the total.');
            }

            $sale = Sale::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'sale_no' => $this->generateSaleNo($branchId),
                'cashier_user_id' => Auth::id(),
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
                    'discount_amount' => 0,
                    'line_total' => $item['line_total'],
                ]);

                if ($product->stock_tracking === 'tracked') {
                    $after = round($before - $item['quantity'], 2);

                    $product->update(['quantity' => $after]);

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
                    abort(422, 'No open cash drawer found for this branch.');
                }

                CashDrawerTransaction::create([
                    'tenant_id' => $tenantId,
                    'cash_drawer_id' => $cashDrawer->id,
                    'type' => 'cash_sale',
                    'amount' => $grandTotal,
                    'reference_type' => 'sale',
                    'reference_id' => $sale->id,
                    'remarks' => 'POS cash sale: ' . $sale->sale_no,
                    'created_by' => Auth::id(),
                ]);

                $cashDrawer->update([
                    'total_cash_sales' => round((float) $cashDrawer->total_cash_sales + $grandTotal, 2),
                    'expected_balance' => round((float) $cashDrawer->expected_balance + $grandTotal, 2),
                ]);
            }

            return $sale->load(['items', 'payments']);
        });

        return back()->with([
            'success' => 'Sale completed successfully.',
            'sale_id' => $sale->id,
            'sale_no' => $sale->sale_no,
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