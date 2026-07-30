<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Services\Inventory\InventoryAccessContext;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Throwable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\Response;

final class ProcurementReportController extends Controller
{
    private const ROUTE_NAMES = [
        'suppliers' => 'reports.procurement.suppliers',
        'purchase-orders' => 'reports.procurement.purchase-orders',
        'purchase-approvals' => 'reports.procurement.purchase-approvals',
        'receiving' => 'reports.procurement.receiving',
        'received-orders' => 'reports.procurement.received-orders',
    ];

    private const PURCHASE_ORDER_STATUSES = [
        'draft' => 'Draft',
        'pending' => 'Awaiting Approval',
        'approved' => 'Approved',
        'partially_received' => 'Partially Received',
        'received' => 'Received',
        'cancelled' => 'Cancelled',
    ];

    public function __construct(
        private readonly InventoryAccessContext $access
    ) {
    }

    public function suppliersPdf(Request $request): Response
    {
        return $this->pdf($request, 'suppliers');
    }

    public function suppliersExcelPreview(Request $request): View
    {
        return $this->excelPreview($request, 'suppliers');
    }

    public function suppliersExcel(Request $request): Response
    {
        return $this->excel($request, 'suppliers');
    }

    public function purchaseOrdersPdf(Request $request): Response
    {
        return $this->pdf($request, 'purchase-orders');
    }

    public function purchaseOrdersExcelPreview(Request $request): View
    {
        return $this->excelPreview($request, 'purchase-orders');
    }

    public function purchaseOrdersExcel(Request $request): Response
    {
        return $this->excel($request, 'purchase-orders');
    }

    public function purchaseApprovalsPdf(Request $request): Response
    {
        return $this->pdf($request, 'purchase-approvals');
    }

    public function purchaseApprovalsExcelPreview(Request $request): View
    {
        return $this->excelPreview($request, 'purchase-approvals');
    }

    public function purchaseApprovalsExcel(Request $request): Response
    {
        return $this->excel($request, 'purchase-approvals');
    }

    public function receivingPdf(Request $request): Response
    {
        return $this->pdf($request, 'receiving');
    }

    public function receivingExcelPreview(Request $request): View
    {
        return $this->excelPreview($request, 'receiving');
    }

    public function receivingExcel(Request $request): Response
    {
        return $this->excel($request, 'receiving');
    }

    public function receivedOrdersPdf(Request $request): Response
    {
        return $this->pdf($request, 'received-orders');
    }

    public function receivedOrdersExcelPreview(Request $request): View
    {
        return $this->excelPreview($request, 'received-orders');
    }

    public function receivedOrdersExcel(Request $request): Response
    {
        return $this->excel($request, 'received-orders');
    }

    private function pdf(Request $request, string $module): Response
    {
        $report = $this->buildReportData($request, $module);

        $pdf = Pdf::loadView(
            'reports.procurement.report',
            $report
        )->setPaper('a4', 'landscape');

        return $pdf->stream(
            $report['fileName'].'-'.now()->format('Y-m-d-His').'.pdf'
        );
    }

    private function excelPreview(Request $request, string $module): View
    {
        $report = $this->buildReportData($request, $module);
        $routeBase = self::ROUTE_NAMES[$module];
        $query = $this->filterQuery($report['filters']);

        return view('reports.procurement.excel-preview', [
            ...$report,
            'downloadMode' => false,
            'excelDownloadUrl' => route($routeBase.'.excel', $query),
            'pdfUrl' => route($routeBase.'.pdf', $query),
        ]);
    }

    private function excel(Request $request, string $module): Response
    {
        $report = $this->buildReportData($request, $module);

        $html = view('reports.procurement.excel-preview', [
            ...$report,
            'downloadMode' => true,
            'excelDownloadUrl' => '',
            'pdfUrl' => '',
        ])->render();

        return response(
            "\xEF\xBB\xBF".$html,
            200,
            [
                'Content-Type' =>
                    'application/vnd.ms-excel; charset=UTF-8',
                'Content-Disposition' =>
                    'attachment; filename="'
                    .$report['fileName'].'-'
                    .now()->format('Y-m-d-His').'.xls"',
                'Cache-Control' =>
                    'no-store, no-cache, must-revalidate, max-age=0',
                'Pragma' => 'no-cache',
                'Expires' => '0',
            ]
        );
    }

    private function buildReportData(Request $request, string $module): array
    {
        abort_unless(
            array_key_exists($module, self::ROUTE_NAMES),
            404
        );

        $context = $this->access->resolve($request);

        abort_unless(
            (bool) ($context['can_export'] ?? false),
            403,
            'PDF and Excel exports are unavailable while the subscription is read-only.'
        );

        $report = match ($module) {
            'suppliers' => $this->supplierReport($request, $context),
            'purchase-orders' => $this->purchaseOrderReport($request, $context),
            'purchase-approvals' => $this->purchaseApprovalReport($request, $context),
            'receiving' => $this->receivingReport($request, $context),
            'received-orders' => $this->receivedOrderReport($request, $context),
        };

        return [
            ...$report,
            'module' => $module,
            'generatedAt' => now(),
            'generatedBy' => $request->user()?->name
                ?? $request->user()?->email
                ?? 'Authenticated user',
        ];
    }

    private function supplierReport(Request $request, array $context): array
    {
        $tenantId = (int) $context['account_owner_id'];
        $filters = [
            'search' => trim((string) $request->input('search', '')),
            'status' => trim((string) $request->input('status', '')),
            'sort' => trim((string) $request->input('sort', 'latest')),
        ];

        $allowedSorts = [
            'latest',
            'oldest',
            'name_asc',
            'name_desc',
            'code_asc',
            'code_desc',
        ];

        if (! in_array($filters['sort'], $allowedSorts, true)) {
            $filters['sort'] = 'latest';
        }

        $query = DB::connection('mysql')
            ->table('suppliers')
            ->where('tenant_id', $tenantId)
            ->whereNull('deleted_at')
            ->when(
                $filters['search'] !== '',
                function ($query) use ($filters): void {
                    $like = '%'.$filters['search'].'%';

                    $query->where(function ($searchQuery) use ($like): void {
                        $searchQuery
                            ->where('code', 'like', $like)
                            ->orWhere('name', 'like', $like)
                            ->orWhere('contact_person', 'like', $like)
                            ->orWhere('email', 'like', $like)
                            ->orWhere('phone', 'like', $like)
                            ->orWhere('alternate_phone', 'like', $like)
                            ->orWhere('address', 'like', $like)
                            ->orWhere('tax_number', 'like', $like);
                    });
                }
            )
            ->when(
                $filters['status'] === 'active',
                fn ($query) => $query->where('is_active', true)
            )
            ->when(
                $filters['status'] === 'inactive',
                fn ($query) => $query->where('is_active', false)
            );

        match ($filters['sort']) {
            'oldest' => $query->orderBy('created_at')->orderBy('id'),
            'name_asc' => $query->orderBy('name')->orderBy('id'),
            'name_desc' => $query->orderByDesc('name')->orderByDesc('id'),
            'code_asc' => $query->orderBy('code')->orderBy('id'),
            'code_desc' => $query->orderByDesc('code')->orderByDesc('id'),
            default => $query->orderByDesc('created_at')->orderByDesc('id'),
        };

        $records = $query->get([
            'id',
            'code',
            'name',
            'contact_person',
            'email',
            'phone',
            'alternate_phone',
            'address',
            'payment_terms',
            'credit_limit',
            'is_active',
            'created_at',
        ]);

        return [
            'title' => 'Supplier Directory',
            'subtitle' =>
                'Supplier identity, contact information, commercial terms, credit limits, and procurement availability.',
            'fileName' => 'supplier-directory',
            'columns' => [
                ['key' => 'row_number', 'label' => '#', 'width' => '3%', 'align' => 'center'],
                ['key' => 'code', 'label' => 'Code', 'width' => '8%'],
                ['key' => 'name', 'label' => 'Supplier', 'width' => '15%'],
                ['key' => 'contact_person', 'label' => 'Contact Person', 'width' => '12%'],
                ['key' => 'contact', 'label' => 'Phone / Email', 'width' => '17%'],
                ['key' => 'address', 'label' => 'Address', 'width' => '18%'],
                ['key' => 'payment_terms', 'label' => 'Payment Terms', 'width' => '10%'],
                ['key' => 'credit_limit', 'label' => 'Credit Limit', 'width' => '10%', 'align' => 'right', 'format' => 'money'],
                ['key' => 'status', 'label' => 'Status', 'width' => '7%', 'align' => 'center', 'format' => 'status'],
            ],
            'rows' => $records->values()->map(
                fn (object $supplier, int $index): array => [
                    'row_number' => $index + 1,
                    'code' => $supplier->code,
                    'name' => $supplier->name,
                    'contact_person' => $supplier->contact_person ?: '—',
                    'contact' => $this->joinLines([
                        $supplier->phone,
                        $supplier->alternate_phone,
                        $supplier->email,
                    ]),
                    'address' => $supplier->address ?: '—',
                    'payment_terms' => $supplier->payment_terms ?: '—',
                    'credit_limit' => (float) $supplier->credit_limit,
                    'status' => (bool) $supplier->is_active ? 'Active' : 'Inactive',
                ]
            ),
            'summary' => [
                ['label' => 'Suppliers', 'value' => $records->count()],
                ['label' => 'Active', 'value' => $records->where('is_active', 1)->count()],
                ['label' => 'Inactive', 'value' => $records->where('is_active', 0)->count()],
                ['label' => 'Total Credit Limit', 'value' => (float) $records->sum('credit_limit'), 'format' => 'money'],
            ],
            'filters' => $filters,
            'filterLabels' => $this->supplierFilterLabels($filters),
        ];
    }

    private function purchaseOrderReport(Request $request, array $context): array
    {
        $tenantId = (int) $context['account_owner_id'];
        $branchId = $context['branch_id'] !== null
            ? (int) $context['branch_id']
            : null;
        $filters = $this->procurementFilters($request, true);

        $records = $this->purchaseOrderBaseQuery($tenantId, $branchId)
            ->when(
                $filters['search'] !== '',
                fn ($query) => $this->applyPurchaseOrderSearch(
                    $query,
                    $filters['search']
                )
            )
            ->when(
                array_key_exists($filters['status'], self::PURCHASE_ORDER_STATUSES),
                fn ($query) => $query->where(
                    'purchase_orders.status',
                    $filters['status']
                )
            )
            ->when(
                $filters['supplier_id'] > 0,
                fn ($query) => $query->where(
                    'purchase_orders.supplier_id',
                    $filters['supplier_id']
                )
            )
            ->when(
                $filters['warehouse_id'] > 0,
                fn ($query) => $query->where(
                    'purchase_orders.warehouse_id',
                    $filters['warehouse_id']
                )
            )
            ->when(
                $filters['date_from'] !== null,
                fn ($query) => $query->whereDate(
                    'purchase_orders.order_date',
                    '>=',
                    $filters['date_from']
                )
            )
            ->when(
                $filters['date_to'] !== null,
                fn ($query) => $query->whereDate(
                    'purchase_orders.order_date',
                    '<=',
                    $filters['date_to']
                )
            )
            ->orderByDesc('purchase_orders.order_date')
            ->orderByDesc('purchase_orders.id')
            ->get();

        return [
            'title' => 'Purchase Order Register',
            'subtitle' =>
                'Purchase order pipeline, supplier commitments, receiving destinations, quantities, and financial totals.',
            'fileName' => 'purchase-order-register',
            'columns' => $this->purchaseOrderColumns(),
            'rows' => $this->mapPurchaseOrderRows($records),
            'summary' => [
                ['label' => 'Orders', 'value' => $records->count()],
                ['label' => 'Awaiting Approval', 'value' => $records->where('status', 'pending')->count()],
                ['label' => 'In Receiving', 'value' => $records->whereIn('status', ['approved', 'partially_received'])->count()],
                ['label' => 'Total Order Value', 'value' => (float) $records->sum('total_amount'), 'format' => 'money'],
            ],
            'filters' => $this->serializableFilters($filters),
            'filterLabels' => $this->procurementFilterLabels(
                $tenantId,
                $filters,
                'Order date'
            ),
        ];
    }

    private function purchaseApprovalReport(Request $request, array $context): array
    {
        abort_unless(
            (bool) $context['is_owner'],
            403,
            'Only the account owner can export purchase approval records.'
        );

        $tenantId = (int) $context['account_owner_id'];
        $filters = $this->procurementFilters($request, false);

        $records = $this->purchaseOrderBaseQuery($tenantId, null)
            ->where('purchase_orders.status', 'pending')
            ->when(
                $filters['search'] !== '',
                fn ($query) => $this->applyPurchaseOrderSearch(
                    $query,
                    $filters['search']
                )
            )
            ->when(
                $filters['supplier_id'] > 0,
                fn ($query) => $query->where(
                    'purchase_orders.supplier_id',
                    $filters['supplier_id']
                )
            )
            ->when(
                $filters['warehouse_id'] > 0,
                fn ($query) => $query->where(
                    'purchase_orders.warehouse_id',
                    $filters['warehouse_id']
                )
            )
            ->when(
                $filters['date_from'] !== null,
                fn ($query) => $query->whereDate(
                    'purchase_orders.submitted_at',
                    '>=',
                    $filters['date_from']
                )
            )
            ->when(
                $filters['date_to'] !== null,
                fn ($query) => $query->whereDate(
                    'purchase_orders.submitted_at',
                    '<=',
                    $filters['date_to']
                )
            )
            ->orderByRaw('purchase_orders.submitted_at IS NULL')
            ->orderBy('purchase_orders.submitted_at')
            ->orderBy('purchase_orders.id')
            ->get();

        $rows = $records->values()->map(
            function (object $order, int $index): array {
                $submittedAt = $order->submitted_at
                    ? Carbon::parse($order->submitted_at)
                    : null;

                return [
                    'row_number' => $index + 1,
                    'po_number' => $order->po_number,
                    'supplier' => $this->nameWithCode(
                        $order->supplier_name,
                        $order->supplier_code
                    ),
                    'destination' => $this->destinationLabel($order),
                    'submitted_at' => $order->submitted_at,
                    'waiting_days' => $submittedAt
                        ? max(0, $submittedAt->startOfDay()->diffInDays(now()->startOfDay()))
                        : 0,
                    'items_count' => (int) $order->items_count,
                    'ordered_quantity' => (float) $order->ordered_quantity,
                    'total_amount' => (float) $order->total_amount,
                    'payment_terms' => $order->payment_terms ?: '—',
                ];
            }
        );

        return [
            'title' => 'Purchase Approval Register',
            'subtitle' =>
                'Submitted purchase orders awaiting owner approval, including request age, destination, quantities, and value.',
            'fileName' => 'purchase-approval-register',
            'columns' => [
                ['key' => 'row_number', 'label' => '#', 'width' => '3%', 'align' => 'center'],
                ['key' => 'po_number', 'label' => 'PO Number', 'width' => '10%'],
                ['key' => 'supplier', 'label' => 'Supplier', 'width' => '16%'],
                ['key' => 'destination', 'label' => 'Destination', 'width' => '18%'],
                ['key' => 'submitted_at', 'label' => 'Submitted', 'width' => '13%', 'format' => 'datetime'],
                ['key' => 'waiting_days', 'label' => 'Waiting Days', 'width' => '8%', 'align' => 'center', 'format' => 'integer'],
                ['key' => 'items_count', 'label' => 'Items', 'width' => '7%', 'align' => 'right', 'format' => 'integer'],
                ['key' => 'ordered_quantity', 'label' => 'Ordered Qty', 'width' => '9%', 'align' => 'right', 'format' => 'quantity'],
                ['key' => 'total_amount', 'label' => 'Total', 'width' => '10%', 'align' => 'right', 'format' => 'money'],
                ['key' => 'payment_terms', 'label' => 'Terms', 'width' => '6%'],
            ],
            'rows' => $rows,
            'summary' => [
                ['label' => 'Pending Requests', 'value' => $records->count()],
                ['label' => 'Submitted Today', 'value' => $records->filter(
                    fn (object $order): bool => $order->submitted_at
                        && Carbon::parse($order->submitted_at)->isToday()
                )->count()],
                ['label' => 'Ordered Quantity', 'value' => (float) $records->sum('ordered_quantity'), 'format' => 'quantity'],
                ['label' => 'Pending Value', 'value' => (float) $records->sum('total_amount'), 'format' => 'money'],
            ],
            'filters' => $this->serializableFilters($filters),
            'filterLabels' => [
                'Status: Awaiting Approval',
                ...$this->procurementFilterLabels(
                    $tenantId,
                    $filters,
                    'Submitted date'
                ),
            ],
        ];
    }

    private function receivingReport(Request $request, array $context): array
    {
        $tenantId = (int) $context['account_owner_id'];
        $branchId = $context['branch_id'] !== null
            ? (int) $context['branch_id']
            : null;
        $filters = $this->procurementFilters($request, true);

        $records = DB::connection('mysql')
            ->table('purchase_receipts')
            ->join('purchase_orders', function ($join): void {
                $join
                    ->on('purchase_orders.id', '=', 'purchase_receipts.purchase_order_id')
                    ->on('purchase_orders.tenant_id', '=', 'purchase_receipts.tenant_id');
            })
            ->join('suppliers', function ($join): void {
                $join
                    ->on('suppliers.id', '=', 'purchase_receipts.supplier_id')
                    ->on('suppliers.tenant_id', '=', 'purchase_receipts.tenant_id');
            })
            ->join('branches', function ($join): void {
                $join
                    ->on('branches.id', '=', 'purchase_receipts.branch_id')
                    ->on('branches.tenant_id', '=', 'purchase_receipts.tenant_id');
            })
            ->join('warehouses', function ($join): void {
                $join
                    ->on('warehouses.id', '=', 'purchase_receipts.warehouse_id')
                    ->on('warehouses.tenant_id', '=', 'purchase_receipts.tenant_id');
            })
            ->where('purchase_receipts.tenant_id', $tenantId)
            ->when(
                $branchId !== null,
                fn ($query) => $query->where(
                    'purchase_receipts.branch_id',
                    $branchId
                )
            )
            ->when(
                $filters['search'] !== '',
                function ($query) use ($filters): void {
                    $like = '%'.$filters['search'].'%';

                    $query->where(function ($searchQuery) use ($like): void {
                        $searchQuery
                            ->where('purchase_receipts.receipt_number', 'like', $like)
                            ->orWhere('purchase_receipts.delivery_reference', 'like', $like)
                            ->orWhere('purchase_orders.po_number', 'like', $like)
                            ->orWhere('suppliers.name', 'like', $like)
                            ->orWhere('suppliers.code', 'like', $like)
                            ->orWhere('branches.name', 'like', $like)
                            ->orWhere('warehouses.name', 'like', $like)
                            ->orWhere('purchase_receipts.notes', 'like', $like);
                    });
                }
            )
            ->when(
                in_array($filters['status'], ['posted', 'voided'], true),
                fn ($query) => $query->where(
                    'purchase_receipts.status',
                    $filters['status']
                )
            )
            ->when(
                $filters['supplier_id'] > 0,
                fn ($query) => $query->where(
                    'purchase_receipts.supplier_id',
                    $filters['supplier_id']
                )
            )
            ->when(
                $filters['warehouse_id'] > 0,
                fn ($query) => $query->where(
                    'purchase_receipts.warehouse_id',
                    $filters['warehouse_id']
                )
            )
            ->when(
                $filters['date_from'] !== null,
                fn ($query) => $query->whereDate(
                    'purchase_receipts.received_date',
                    '>=',
                    $filters['date_from']
                )
            )
            ->when(
                $filters['date_to'] !== null,
                fn ($query) => $query->whereDate(
                    'purchase_receipts.received_date',
                    '<=',
                    $filters['date_to']
                )
            )
            ->select([
                'purchase_receipts.id',
                'purchase_receipts.receipt_number',
                'purchase_receipts.delivery_reference',
                'purchase_receipts.received_date',
                'purchase_receipts.status',
                'purchase_receipts.total_quantity',
                'purchase_receipts.total_amount',
                'purchase_receipts.posted_at',
                'purchase_receipts.voided_at',
                'purchase_orders.po_number',
                'suppliers.name as supplier_name',
                'suppliers.code as supplier_code',
                'branches.name as branch_name',
                'branches.code as branch_code',
                'warehouses.name as warehouse_name',
                'warehouses.code as warehouse_code',
            ])
            ->selectSub(
                fn ($query) => $query
                    ->from('purchase_receipt_items')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn(
                        'purchase_receipt_items.purchase_receipt_id',
                        'purchase_receipts.id'
                    ),
                'items_count'
            )
            ->orderByDesc('purchase_receipts.received_date')
            ->orderByDesc('purchase_receipts.id')
            ->get();

        $rows = $records->values()->map(
            fn (object $receipt, int $index): array => [
                'row_number' => $index + 1,
                'receipt_number' => $receipt->receipt_number,
                'po_number' => $receipt->po_number,
                'supplier' => $this->nameWithCode(
                    $receipt->supplier_name,
                    $receipt->supplier_code
                ),
                'destination' => $this->destinationLabel($receipt),
                'received_date' => $receipt->received_date,
                'status' => ucfirst((string) $receipt->status),
                'items_count' => (int) $receipt->items_count,
                'total_quantity' => (float) $receipt->total_quantity,
                'total_amount' => (float) $receipt->total_amount,
                'delivery_reference' => $receipt->delivery_reference ?: '—',
            ]
        );

        return [
            'title' => 'Receiving and Receipt Register',
            'subtitle' =>
                'Posted and reversed supplier deliveries, receipt references, destinations, quantities, and received value.',
            'fileName' => 'receiving-receipt-register',
            'columns' => [
                ['key' => 'row_number', 'label' => '#', 'width' => '3%', 'align' => 'center'],
                ['key' => 'receipt_number', 'label' => 'Receipt', 'width' => '10%'],
                ['key' => 'po_number', 'label' => 'PO Number', 'width' => '9%'],
                ['key' => 'supplier', 'label' => 'Supplier', 'width' => '14%'],
                ['key' => 'destination', 'label' => 'Destination', 'width' => '17%'],
                ['key' => 'received_date', 'label' => 'Received', 'width' => '9%', 'format' => 'date'],
                ['key' => 'status', 'label' => 'Status', 'width' => '7%', 'align' => 'center', 'format' => 'status'],
                ['key' => 'items_count', 'label' => 'Items', 'width' => '6%', 'align' => 'right', 'format' => 'integer'],
                ['key' => 'total_quantity', 'label' => 'Quantity', 'width' => '8%', 'align' => 'right', 'format' => 'quantity'],
                ['key' => 'total_amount', 'label' => 'Value', 'width' => '9%', 'align' => 'right', 'format' => 'money'],
                ['key' => 'delivery_reference', 'label' => 'Delivery Ref.', 'width' => '8%'],
            ],
            'rows' => $rows,
            'summary' => [
                ['label' => 'Receipts', 'value' => $records->count()],
                ['label' => 'Posted', 'value' => $records->where('status', 'posted')->count()],
                ['label' => 'Voided', 'value' => $records->where('status', 'voided')->count()],
                ['label' => 'Received Value', 'value' => (float) $records->where('status', 'posted')->sum('total_amount'), 'format' => 'money'],
            ],
            'filters' => $this->serializableFilters($filters),
            'filterLabels' => $this->procurementFilterLabels(
                $tenantId,
                $filters,
                'Receipt date',
                ['posted' => 'Posted', 'voided' => 'Voided']
            ),
        ];
    }

    private function receivedOrderReport(Request $request, array $context): array
    {
        $tenantId = (int) $context['account_owner_id'];
        $branchId = $context['branch_id'] !== null
            ? (int) $context['branch_id']
            : null;
        $filters = $this->procurementFilters($request, false);

        $receiptSummary = DB::connection('mysql')
            ->table('purchase_receipts')
            ->where('tenant_id', $tenantId)
            ->where('status', 'posted')
            ->groupBy('purchase_order_id')
            ->select([
                'purchase_order_id',
                DB::raw('COUNT(*) as receipt_count'),
                DB::raw('MIN(received_date) as first_received_date'),
                DB::raw('MAX(received_date) as completed_date'),
                DB::raw('MAX(posted_at) as completed_at'),
                DB::raw('COALESCE(SUM(total_quantity), 0) as received_quantity'),
                DB::raw('COALESCE(SUM(total_amount), 0) as received_value'),
            ]);

        $records = DB::connection('mysql')
            ->table('purchase_orders')
            ->join('suppliers', function ($join): void {
                $join
                    ->on('suppliers.id', '=', 'purchase_orders.supplier_id')
                    ->on('suppliers.tenant_id', '=', 'purchase_orders.tenant_id');
            })
            ->join('branches', function ($join): void {
                $join
                    ->on('branches.id', '=', 'purchase_orders.branch_id')
                    ->on('branches.tenant_id', '=', 'purchase_orders.tenant_id');
            })
            ->join('warehouses', function ($join): void {
                $join
                    ->on('warehouses.id', '=', 'purchase_orders.warehouse_id')
                    ->on('warehouses.tenant_id', '=', 'purchase_orders.tenant_id');
            })
            ->joinSub($receiptSummary, 'receipt_summary', function ($join): void {
                $join->on(
                    'receipt_summary.purchase_order_id',
                    '=',
                    'purchase_orders.id'
                );
            })
            ->where('purchase_orders.tenant_id', $tenantId)
            ->where('purchase_orders.status', 'received')
            ->whereNull('purchase_orders.deleted_at')
            ->when(
                $branchId !== null,
                fn ($query) => $query->where(
                    'purchase_orders.branch_id',
                    $branchId
                )
            )
            ->when(
                $filters['search'] !== '',
                function ($query) use ($filters, $tenantId): void {
                    $like = '%'.$filters['search'].'%';

                    $query->where(function ($searchQuery) use ($like, $tenantId): void {
                        $searchQuery
                            ->where('purchase_orders.po_number', 'like', $like)
                            ->orWhere('suppliers.name', 'like', $like)
                            ->orWhere('suppliers.code', 'like', $like)
                            ->orWhere('branches.name', 'like', $like)
                            ->orWhere('branches.code', 'like', $like)
                            ->orWhere('warehouses.name', 'like', $like)
                            ->orWhere('warehouses.code', 'like', $like)
                            ->orWhereExists(function ($receiptQuery) use ($like, $tenantId): void {
                                $receiptQuery
                                    ->selectRaw('1')
                                    ->from('purchase_receipts')
                                    ->whereColumn(
                                        'purchase_receipts.purchase_order_id',
                                        'purchase_orders.id'
                                    )
                                    ->where('purchase_receipts.tenant_id', $tenantId)
                                    ->where(function ($referenceQuery) use ($like): void {
                                        $referenceQuery
                                            ->where('purchase_receipts.receipt_number', 'like', $like)
                                            ->orWhere('purchase_receipts.delivery_reference', 'like', $like);
                                    });
                            });
                    });
                }
            )
            ->when(
                $filters['supplier_id'] > 0,
                fn ($query) => $query->where(
                    'purchase_orders.supplier_id',
                    $filters['supplier_id']
                )
            )
            ->when(
                $filters['warehouse_id'] > 0,
                fn ($query) => $query->where(
                    'purchase_orders.warehouse_id',
                    $filters['warehouse_id']
                )
            )
            ->when(
                $filters['date_from'] !== null,
                fn ($query) => $query->whereDate(
                    'receipt_summary.completed_date',
                    '>=',
                    $filters['date_from']
                )
            )
            ->when(
                $filters['date_to'] !== null,
                fn ($query) => $query->whereDate(
                    'receipt_summary.completed_date',
                    '<=',
                    $filters['date_to']
                )
            )
            ->select([
                'purchase_orders.id',
                'purchase_orders.po_number',
                'purchase_orders.order_date',
                'purchase_orders.expected_delivery_date',
                'purchase_orders.payment_terms',
                'purchase_orders.total_amount',
                'suppliers.name as supplier_name',
                'suppliers.code as supplier_code',
                'branches.name as branch_name',
                'branches.code as branch_code',
                'warehouses.name as warehouse_name',
                'warehouses.code as warehouse_code',
                'receipt_summary.receipt_count',
                'receipt_summary.first_received_date',
                'receipt_summary.completed_date',
                'receipt_summary.completed_at',
                'receipt_summary.received_quantity',
                'receipt_summary.received_value',
            ])
            ->orderByDesc('receipt_summary.completed_date')
            ->orderByDesc('receipt_summary.completed_at')
            ->orderByDesc('purchase_orders.id')
            ->get();

        $rows = $records->values()->map(
            fn (object $order, int $index): array => [
                'row_number' => $index + 1,
                'po_number' => $order->po_number,
                'supplier' => $this->nameWithCode(
                    $order->supplier_name,
                    $order->supplier_code
                ),
                'destination' => $this->destinationLabel($order),
                'order_date' => $order->order_date,
                'completed_date' => $order->completed_date,
                'receipt_count' => (int) $order->receipt_count,
                'received_quantity' => (float) $order->received_quantity,
                'received_value' => (float) $order->received_value,
                'payment_terms' => $order->payment_terms ?: '—',
            ]
        );

        return [
            'title' => 'Received Order Register',
            'subtitle' =>
                'Fully received purchase orders, completion dates, receipt counts, quantities, values, suppliers, and destinations.',
            'fileName' => 'received-order-register',
            'columns' => [
                ['key' => 'row_number', 'label' => '#', 'width' => '3%', 'align' => 'center'],
                ['key' => 'po_number', 'label' => 'PO Number', 'width' => '11%'],
                ['key' => 'supplier', 'label' => 'Supplier', 'width' => '16%'],
                ['key' => 'destination', 'label' => 'Destination', 'width' => '19%'],
                ['key' => 'order_date', 'label' => 'Order Date', 'width' => '9%', 'format' => 'date'],
                ['key' => 'completed_date', 'label' => 'Completed', 'width' => '9%', 'format' => 'date'],
                ['key' => 'receipt_count', 'label' => 'Receipts', 'width' => '7%', 'align' => 'right', 'format' => 'integer'],
                ['key' => 'received_quantity', 'label' => 'Quantity', 'width' => '9%', 'align' => 'right', 'format' => 'quantity'],
                ['key' => 'received_value', 'label' => 'Received Value', 'width' => '11%', 'align' => 'right', 'format' => 'money'],
                ['key' => 'payment_terms', 'label' => 'Terms', 'width' => '6%'],
            ],
            'rows' => $rows,
            'summary' => [
                ['label' => 'Received Orders', 'value' => $records->count()],
                ['label' => 'Receipt Records', 'value' => (int) $records->sum('receipt_count')],
                ['label' => 'Units Received', 'value' => (float) $records->sum('received_quantity'), 'format' => 'quantity'],
                ['label' => 'Received Value', 'value' => (float) $records->sum('received_value'), 'format' => 'money'],
            ],
            'filters' => $this->serializableFilters($filters),
            'filterLabels' => [
                'Status: Fully Received',
                ...$this->procurementFilterLabels(
                    $tenantId,
                    $filters,
                    'Completion date'
                ),
            ],
        ];
    }

    private function purchaseOrderBaseQuery(int $tenantId, ?int $branchId)
    {
        return DB::connection('mysql')
            ->table('purchase_orders')
            ->leftJoin('suppliers', function ($join): void {
                $join
                    ->on('suppliers.id', '=', 'purchase_orders.supplier_id')
                    ->on('suppliers.tenant_id', '=', 'purchase_orders.tenant_id');
            })
            ->leftJoin('branches', function ($join): void {
                $join
                    ->on('branches.id', '=', 'purchase_orders.branch_id')
                    ->on('branches.tenant_id', '=', 'purchase_orders.tenant_id');
            })
            ->leftJoin('warehouses', function ($join): void {
                $join
                    ->on('warehouses.id', '=', 'purchase_orders.warehouse_id')
                    ->on('warehouses.tenant_id', '=', 'purchase_orders.tenant_id');
            })
            ->where('purchase_orders.tenant_id', $tenantId)
            ->whereNull('purchase_orders.deleted_at')
            ->when(
                $branchId !== null,
                fn ($query) => $query->where(
                    'purchase_orders.branch_id',
                    $branchId
                )
            )
            ->select([
                'purchase_orders.id',
                'purchase_orders.po_number',
                'purchase_orders.order_date',
                'purchase_orders.expected_delivery_date',
                'purchase_orders.status',
                'purchase_orders.payment_terms',
                'purchase_orders.total_amount',
                'purchase_orders.submitted_at',
                'suppliers.name as supplier_name',
                'suppliers.code as supplier_code',
                'branches.name as branch_name',
                'branches.code as branch_code',
                'warehouses.name as warehouse_name',
                'warehouses.code as warehouse_code',
            ])
            ->selectSub(
                fn ($query) => $query
                    ->from('purchase_order_items')
                    ->selectRaw('COUNT(*)')
                    ->whereColumn(
                        'purchase_order_items.purchase_order_id',
                        'purchase_orders.id'
                    )
                    ->whereColumn(
                        'purchase_order_items.tenant_id',
                        'purchase_orders.tenant_id'
                    ),
                'items_count'
            )
            ->selectSub(
                fn ($query) => $query
                    ->from('purchase_order_items')
                    ->selectRaw('COALESCE(SUM(quantity), 0)')
                    ->whereColumn(
                        'purchase_order_items.purchase_order_id',
                        'purchase_orders.id'
                    )
                    ->whereColumn(
                        'purchase_order_items.tenant_id',
                        'purchase_orders.tenant_id'
                    ),
                'ordered_quantity'
            )
            ->selectSub(
                fn ($query) => $query
                    ->from('purchase_order_items')
                    ->selectRaw('COALESCE(SUM(received_quantity), 0)')
                    ->whereColumn(
                        'purchase_order_items.purchase_order_id',
                        'purchase_orders.id'
                    )
                    ->whereColumn(
                        'purchase_order_items.tenant_id',
                        'purchase_orders.tenant_id'
                    ),
                'received_quantity'
            );
    }

    private function applyPurchaseOrderSearch($query, string $search): void
    {
        $like = '%'.$search.'%';

        $query->where(function ($searchQuery) use ($like): void {
            $searchQuery
                ->where('purchase_orders.po_number', 'like', $like)
                ->orWhere('suppliers.name', 'like', $like)
                ->orWhere('suppliers.code', 'like', $like)
                ->orWhere('branches.name', 'like', $like)
                ->orWhere('branches.code', 'like', $like)
                ->orWhere('warehouses.name', 'like', $like)
                ->orWhere('warehouses.code', 'like', $like);
        });
    }

    private function purchaseOrderColumns(): array
    {
        return [
            ['key' => 'row_number', 'label' => '#', 'width' => '3%', 'align' => 'center'],
            ['key' => 'po_number', 'label' => 'PO Number', 'width' => '10%'],
            ['key' => 'supplier', 'label' => 'Supplier', 'width' => '15%'],
            ['key' => 'destination', 'label' => 'Destination', 'width' => '17%'],
            ['key' => 'order_date', 'label' => 'Order Date', 'width' => '8%', 'format' => 'date'],
            ['key' => 'expected_delivery_date', 'label' => 'Expected', 'width' => '8%', 'format' => 'date'],
            ['key' => 'status', 'label' => 'Status', 'width' => '9%', 'align' => 'center', 'format' => 'status'],
            ['key' => 'items_count', 'label' => 'Items', 'width' => '6%', 'align' => 'right', 'format' => 'integer'],
            ['key' => 'ordered_quantity', 'label' => 'Ordered', 'width' => '8%', 'align' => 'right', 'format' => 'quantity'],
            ['key' => 'received_quantity', 'label' => 'Received', 'width' => '8%', 'align' => 'right', 'format' => 'quantity'],
            ['key' => 'total_amount', 'label' => 'Total', 'width' => '8%', 'align' => 'right', 'format' => 'money'],
        ];
    }

    private function mapPurchaseOrderRows(Collection $records): Collection
    {
        return $records->values()->map(
            fn (object $order, int $index): array => [
                'row_number' => $index + 1,
                'po_number' => $order->po_number,
                'supplier' => $this->nameWithCode(
                    $order->supplier_name,
                    $order->supplier_code
                ),
                'destination' => $this->destinationLabel($order),
                'order_date' => $order->order_date,
                'expected_delivery_date' => $order->expected_delivery_date,
                'status' => self::PURCHASE_ORDER_STATUSES[$order->status]
                    ?? ucwords(str_replace('_', ' ', $order->status)),
                'items_count' => (int) $order->items_count,
                'ordered_quantity' => (float) $order->ordered_quantity,
                'received_quantity' => (float) $order->received_quantity,
                'total_amount' => (float) $order->total_amount,
            ]
        );
    }

    private function procurementFilters(
        Request $request,
        bool $includeStatus
    ): array {
        return [
            'search' => trim((string) $request->input('search', '')),
            'status' => $includeStatus
                ? trim((string) $request->input('status', ''))
                : '',
            'supplier_id' => max(0, (int) $request->input('supplier_id', 0)),
            'warehouse_id' => max(0, (int) $request->input('warehouse_id', 0)),
            'date_from' => $this->validDate(
                (string) $request->input('date_from', '')
            ),
            'date_to' => $this->validDate(
                (string) $request->input('date_to', '')
            ),
        ];
    }

    private function supplierFilterLabels(array $filters): array
    {
        $labels = [];

        if ($filters['search'] !== '') {
            $labels[] = 'Search: '.$filters['search'];
        }

        if ($filters['status'] === 'active') {
            $labels[] = 'Status: Active';
        } elseif ($filters['status'] === 'inactive') {
            $labels[] = 'Status: Inactive';
        }

        $sortLabels = [
            'latest' => 'Latest added',
            'oldest' => 'Oldest added',
            'name_asc' => 'Name A–Z',
            'name_desc' => 'Name Z–A',
            'code_asc' => 'Code A–Z',
            'code_desc' => 'Code Z–A',
        ];

        $labels[] = 'Sort: '.($sortLabels[$filters['sort']] ?? 'Latest added');

        return $labels;
    }

    private function procurementFilterLabels(
        int $tenantId,
        array $filters,
        string $dateLabel,
        ?array $statusLabels = null
    ): array {
        $labels = [];

        if ($filters['search'] !== '') {
            $labels[] = 'Search: '.$filters['search'];
        }

        if ($filters['status'] !== '') {
            $labels[] = 'Status: '.(
                $statusLabels[$filters['status']]
                ?? self::PURCHASE_ORDER_STATUSES[$filters['status']]
                ?? ucwords(str_replace('_', ' ', $filters['status']))
            );
        }

        if ($filters['supplier_id'] > 0) {
            $supplier = DB::connection('mysql')
                ->table('suppliers')
                ->where('tenant_id', $tenantId)
                ->where('id', $filters['supplier_id'])
                ->value('name');

            $labels[] = 'Supplier: '.($supplier ?: '#'.$filters['supplier_id']);
        }

        if ($filters['warehouse_id'] > 0) {
            $warehouse = DB::connection('mysql')
                ->table('warehouses')
                ->where('tenant_id', $tenantId)
                ->where('id', $filters['warehouse_id'])
                ->value('name');

            $labels[] = 'Warehouse: '.($warehouse ?: '#'.$filters['warehouse_id']);
        }

        if ($filters['date_from'] !== null) {
            $labels[] = $dateLabel.' from: '.$filters['date_from'];
        }

        if ($filters['date_to'] !== null) {
            $labels[] = $dateLabel.' to: '.$filters['date_to'];
        }

        return $labels;
    }

    private function serializableFilters(array $filters): array
    {
        return collect($filters)
            ->map(fn ($value) => $value ?? '')
            ->all();
    }

    private function filterQuery(array $filters): array
    {
        return collect($filters)
            ->reject(
                fn ($value): bool => $value === ''
                    || $value === null
                    || $value === 0
                    || $value === '0'
            )
            ->all();
    }

    private function validDate(string $date): ?string
    {
        $date = trim($date);

        if ($date === '') {
            return null;
        }

        try {
            $parsed = Carbon::createFromFormat('Y-m-d', $date);
        } catch (Throwable) {
            return null;
        }

        return $parsed !== false && $parsed->format('Y-m-d') === $date
            ? $date
            : null;
    }

    private function destinationLabel(object $record): string
    {
        return $this->nameWithCode(
            $record->branch_name,
            $record->branch_code
        ).' / '.$this->nameWithCode(
            $record->warehouse_name,
            $record->warehouse_code
        );
    }

    private function nameWithCode(?string $name, ?string $code): string
    {
        $name = trim((string) $name);
        $code = trim((string) $code);

        if ($name === '' && $code === '') {
            return '—';
        }

        if ($code === '') {
            return $name;
        }

        if ($name === '') {
            return $code;
        }

        return $name.' ('.$code.')';
    }

    private function joinLines(array $values): string
    {
        $values = collect($values)
            ->map(fn ($value): string => trim((string) $value))
            ->filter()
            ->values();

        return $values->isEmpty()
            ? '—'
            : $values->implode("\n");
    }
}
