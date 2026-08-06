<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\PlatformAuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function __construct(private readonly PlatformAuditLogger $audit)
    {
    }

    public function index(Request $request): Response
    {
        $search = trim((string) $request->string('search'));
        $status = trim((string) $request->string('status'));

        $overdueUpdated = DB::table('invoices')
            ->where('status', 'issued')
            ->whereDate('due_date', '<', now()->toDateString())
            ->update(['status' => 'overdue', 'updated_at' => now()]);

        $invoices = DB::table('invoices')
            ->join('users', 'users.id', '=', 'invoices.user_id')
            ->leftJoin('products', 'products.id', '=', 'invoices.product_id')
            ->leftJoin('orders', 'orders.id', '=', 'invoices.order_id')
            ->leftJoin('subscriptions', 'subscriptions.id', '=', 'invoices.subscription_id')
            ->select([
                'invoices.id',
                'invoices.invoice_number',
                'invoices.order_id',
                'invoices.subscription_id',
                'invoices.user_id',
                'invoices.product_id',
                'invoices.status',
                'invoices.issue_date',
                'invoices.due_date',
                'invoices.subtotal',
                'invoices.tax_amount',
                'invoices.discount_amount',
                'invoices.total_amount',
                'invoices.currency',
                'invoices.notes',
                'invoices.paid_at',
                'invoices.created_at',
                'users.name as user_name',
                'users.email as user_email',
                'products.name as product_name',
                'orders.order_code',
                'subscriptions.subscription_code',
            ])
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($nested) use ($search): void {
                    $nested->where('invoices.invoice_number', 'like', "%{$search}%")
                        ->orWhere('users.name', 'like', "%{$search}%")
                        ->orWhere('users.email', 'like', "%{$search}%")
                        ->orWhere('orders.order_code', 'like', "%{$search}%");
                });
            })
            ->when(in_array($status, ['draft', 'issued', 'paid', 'overdue', 'void'], true), fn ($query) => $query->where('invoices.status', $status))
            ->orderByDesc('invoices.id')
            ->paginate(20)
            ->withQueryString();

        $invoiceIds = $invoices->getCollection()->pluck('id');
        $itemsByInvoice = DB::table('invoice_items')
            ->whereIn('invoice_id', $invoiceIds)
            ->orderBy('id')
            ->get()
            ->groupBy('invoice_id');

        $invoices->getCollection()->transform(function (object $invoice) use ($itemsByInvoice): object {
            $invoice->items = $itemsByInvoice->get($invoice->id, collect())->values();

            return $invoice;
        });

        $orders = DB::table('orders')
            ->join('users', 'users.id', '=', 'orders.account_owner_id')
            ->leftJoin('products', 'products.id', '=', 'orders.product_id')
            ->select([
                'orders.id',
                'orders.order_code',
                'orders.account_owner_id as user_id',
                'orders.product_id',
                'orders.subscription_id',
                'orders.amount',
                'orders.currency',
                'orders.status',
                'users.name as user_name',
                'users.email as user_email',
                'products.name as product_name',
            ])
            ->whereIn('orders.status', ['paid', 'verified'])
            ->whereNotExists(function ($query): void {
                $query->select(DB::raw(1))
                    ->from('invoices')
                    ->whereColumn('invoices.order_id', 'orders.id')
                    ->whereNotIn('invoices.status', ['void']);
            })
            ->orderByDesc('orders.id')
            ->limit(150)
            ->get();

        $users = DB::table('users')
            ->select('id', 'name', 'email')
            ->where('is_active', true)
            ->orderBy('name')
            ->limit(500)
            ->get();

        $products = DB::table('products')
            ->select('id', 'name', 'product_code')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/invoices/index', [
            'invoices' => $invoices,
            'orders' => $orders,
            'users' => $users,
            'products' => $products,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'stats' => [
                'total' => DB::table('invoices')->count(),
                'outstanding' => (float) DB::table('invoices')->whereIn('status', ['issued', 'overdue'])->sum('total_amount'),
                'paid' => (float) DB::table('invoices')->where('status', 'paid')->sum('total_amount'),
                'overdue' => DB::table('invoices')->where('status', 'overdue')->count(),
            ],
            'overdueUpdated' => $overdueUpdated,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'order_id' => ['nullable', 'integer', 'exists:orders,id'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'description' => ['required', 'string', 'max:255'],
            'quantity' => ['required', 'numeric', 'min:0.01', 'max:999999'],
            'unit_price' => ['nullable', 'numeric', 'min:0', 'max:999999999'],
            'tax_amount' => ['required', 'numeric', 'min:0', 'max:999999999'],
            'discount_amount' => ['required', 'numeric', 'min:0', 'max:999999999'],
            'issue_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:issue_date'],
            'status' => ['required', Rule::in(['draft', 'issued'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $order = null;
        if (! empty($validated['order_id'])) {
            $order = DB::table('orders')->where('id', $validated['order_id'])->first();
            abort_unless($order, 404);
        }

        $userId = $order?->account_owner_id ?: ($validated['user_id'] ?? null);
        if (! $userId) {
            return back()->withErrors(['user_id' => 'Select an order or account owner.']);
        }

        $productId = $order?->product_id ?: ($validated['product_id'] ?? null);
        $subscriptionId = $order?->subscription_id;
        $currency = $order?->currency ?: 'PHP';
        $quantity = round((float) $validated['quantity'], 2);
        $unitPrice = $validated['unit_price'] !== null
            ? round((float) $validated['unit_price'], 2)
            : round((float) ($order?->amount ?? 0), 2);
        $subtotal = round($quantity * $unitPrice, 2);
        $tax = round((float) $validated['tax_amount'], 2);
        $discount = round((float) $validated['discount_amount'], 2);
        $total = max(0, round($subtotal + $tax - $discount, 2));

        $invoiceId = DB::transaction(function () use ($request, $validated, $userId, $productId, $subscriptionId, $currency, $quantity, $unitPrice, $subtotal, $tax, $discount, $total): int {
            $invoiceNumber = $this->nextInvoiceNumber();

            $id = DB::table('invoices')->insertGetId([
                'invoice_number' => $invoiceNumber,
                'order_id' => $validated['order_id'] ?: null,
                'subscription_id' => $subscriptionId ?: null,
                'user_id' => $userId,
                'product_id' => $productId ?: null,
                'status' => $validated['status'],
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'],
                'subtotal' => $subtotal,
                'tax_amount' => $tax,
                'discount_amount' => $discount,
                'total_amount' => $total,
                'currency' => $currency,
                'notes' => $validated['notes'] ?: null,
                'created_by' => $request->user()?->getKey(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('invoice_items')->insert([
                'invoice_id' => $id,
                'description' => $validated['description'],
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'line_total' => $subtotal,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return $id;
        });

        $invoiceNumber = DB::table('invoices')->where('id', $invoiceId)->value('invoice_number');

        $this->audit->write(
            $request,
            'invoices',
            'created',
            "Created invoice {$invoiceNumber}.",
            'invoices',
            $invoiceId,
            null,
            ['total_amount' => $total, 'status' => $validated['status'], 'user_id' => $userId],
        );

        return back()->with('success', 'Invoice created.');
    }

    public function markPaid(Request $request, int $invoice): RedirectResponse
    {
        $record = DB::table('invoices')->where('id', $invoice)->first();
        abort_unless($record, 404);
        abort_if($record->status === 'void', 422, 'A void invoice cannot be paid.');

        DB::table('invoices')->where('id', $invoice)->update([
            'status' => 'paid',
            'paid_at' => now(),
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'invoices',
            'marked_paid',
            "Marked invoice {$record->invoice_number} as paid.",
            'invoices',
            $invoice,
            ['status' => $record->status],
            ['status' => 'paid'],
        );

        return back()->with('success', 'Invoice marked as paid.');
    }

    public function void(Request $request, int $invoice): RedirectResponse
    {
        $record = DB::table('invoices')->where('id', $invoice)->first();
        abort_unless($record, 404);
        abort_if($record->status === 'paid', 422, 'A paid invoice cannot be voided.');

        DB::table('invoices')->where('id', $invoice)->update([
            'status' => 'void',
            'updated_at' => now(),
        ]);

        $this->audit->write(
            $request,
            'invoices',
            'voided',
            "Voided invoice {$record->invoice_number}.",
            'invoices',
            $invoice,
            ['status' => $record->status],
            ['status' => 'void'],
        );

        return back()->with('success', 'Invoice voided.');
    }

    public function destroy(Request $request, int $invoice): RedirectResponse
    {
        $record = DB::table('invoices')->where('id', $invoice)->first();
        abort_unless($record, 404);
        abort_unless(in_array($record->status, ['draft', 'void'], true), 422, 'Only draft or void invoices can be deleted.');

        DB::transaction(function () use ($invoice): void {
            DB::table('invoice_items')->where('invoice_id', $invoice)->delete();
            DB::table('invoices')->where('id', $invoice)->delete();
        });

        $this->audit->write(
            $request,
            'invoices',
            'deleted',
            "Deleted invoice {$record->invoice_number}.",
            'invoices',
            $invoice,
            $record,
        );

        return back()->with('success', 'Invoice deleted.');
    }

    private function nextInvoiceNumber(): string
    {
        $prefix = 'INV-'.now()->format('Ym').'-';
        $latest = DB::table('invoices')
            ->where('invoice_number', 'like', $prefix.'%')
            ->orderByDesc('id')
            ->value('invoice_number');

        $sequence = 1;
        if ($latest && preg_match('/(\d+)$/', (string) $latest, $matches)) {
            $sequence = ((int) $matches[1]) + 1;
        }

        return $prefix.str_pad((string) $sequence, 5, '0', STR_PAD_LEFT);
    }
}
