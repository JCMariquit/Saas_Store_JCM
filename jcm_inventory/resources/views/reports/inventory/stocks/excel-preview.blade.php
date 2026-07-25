@php
    $isDownloadMode = (bool) ($downloadMode ?? false);
    $reportQuery = request()->query();
    $pdfUrl = route('reports.inventory.stocks.pdf', $reportQuery);
    $excelDownloadUrl = route('reports.inventory.stocks.excel', $reportQuery);
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $reportTitle }} — Excel Preview</title>

    <style>
        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            min-height: 100%;
        }

        body {
            color: #172033;
            background: #e7ebe8;
            font-family: Calibri, Arial, sans-serif;
            font-size: 12px;
        }

        body.download-mode {
            color: #172033;
            background: #ffffff;
            font-size: 10pt;
        }

        .excel-shell {
            min-height: 100vh;
        }

        .titlebar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            min-height: 46px;
            padding: 8px 14px;
            color: #ffffff;
            background: #185c37;
        }

        .titlebar strong {
            font-size: 13px;
        }

        .titlebar small {
            display: block;
            margin-top: 2px;
            color: #d7eadf;
            font-size: 10px;
        }

        .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 7px;
        }

        .action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 30px;
            padding: 6px 11px;
            color: #ffffff;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.38);
            border-radius: 4px;
            font-size: 11px;
            font-weight: 700;
            text-decoration: none;
        }

        .action:hover {
            background: rgba(255, 255, 255, 0.18);
        }

        .action.primary {
            color: #185c37;
            background: #ffffff;
            border-color: #ffffff;
        }

        .action.primary:hover {
            background: #eef6ef;
        }

        .ribbon {
            background: #f8faf8;
            border-bottom: 1px solid #c7cec9;
        }

        .ribbon-tabs {
            display: flex;
            gap: 2px;
            padding: 0 12px;
            border-bottom: 1px solid #d8ddd9;
        }

        .ribbon-tab {
            padding: 8px 11px 6px;
            color: #334155;
            font-size: 11px;
        }

        .ribbon-tab.active {
            color: #185c37;
            border-bottom: 2px solid #185c37;
            font-weight: 700;
        }

        .ribbon-content {
            display: flex;
            flex-wrap: wrap;
            gap: 18px;
            padding: 8px 14px;
        }

        .ribbon-group {
            min-width: 125px;
            padding-right: 18px;
            border-right: 1px solid #d8ddd9;
        }

        .ribbon-group:last-child {
            border-right: 0;
        }

        .ribbon-label {
            color: #64748b;
            font-size: 9px;
            text-transform: uppercase;
        }

        .ribbon-value {
            margin-top: 3px;
            color: #172033;
            font-size: 11px;
            font-weight: 700;
        }

        .formula-bar {
            display: grid;
            grid-template-columns: 70px 30px minmax(280px, 1fr);
            background: #ffffff;
            border-bottom: 1px solid #c7cec9;
        }

        .formula-cell {
            min-height: 29px;
            padding: 6px 8px;
            border-right: 1px solid #d8ddd9;
        }

        .formula-cell:last-child {
            border-right: 0;
        }

        .workbook {
            overflow: auto;
            padding: 12px;
        }

        body.download-mode .workbook {
            padding: 0;
        }

        .sheet {
            min-width: 1540px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #aeb8b1;
            box-shadow: 0 2px 7px rgba(15, 23, 42, 0.12);
        }

        body.download-mode .sheet {
            border: 0;
            box-shadow: none;
        }

        table {
            width: 100%;
            background: #ffffff;
            border-collapse: collapse;
            table-layout: fixed;
        }

        col.product { width: 210px; }
        col.sku { width: 105px; }
        col.category { width: 125px; }
        col.branch { width: 135px; }
        col.warehouse { width: 160px; }
        col.quantity { width: 92px; }
        col.unit { width: 72px; }
        col.reorder { width: 92px; }
        col.average-cost { width: 108px; }
        col.total-value { width: 115px; }
        col.layers { width: 82px; }
        col.expiring { width: 82px; }
        col.expired { width: 82px; }
        col.stock-status { width: 108px; }
        col.reconcile { width: 108px; }
        col.last-movement { width: 140px; }

        th,
        td {
            padding: 5px 7px;
            border: 1px solid #c7d0ca;
            vertical-align: middle;
            word-wrap: break-word;
        }

        .title-cell {
            height: 35px;
            color: #ffffff;
            background: #185c37;
            font-size: 16pt;
            font-weight: 700;
            text-align: left;
        }

        .subtitle-cell {
            height: 24px;
            color: #185c37;
            background: #e2f0d9;
            font-weight: 600;
            text-align: left;
        }

        .meta-label {
            color: #475569;
            background: #f1f5f2;
            font-weight: 700;
        }

        .summary-label {
            color: #185c37;
            background: #d9ead3;
            font-size: 9pt;
            font-weight: 700;
            text-align: center;
        }

        .summary-value {
            color: #172033;
            background: #eef6ef;
            font-size: 11pt;
            font-weight: 700;
            text-align: center;
        }

        .blank-row td {
            height: 7px;
            padding: 0;
            background: #ffffff;
            border: 0;
        }

        .header-cell {
            height: 30px;
            color: #ffffff;
            background: #185c37;
            font-size: 9pt;
            font-weight: 700;
            text-align: center;
            white-space: normal;
        }

        tbody.stock-rows tr:nth-child(even) td {
            background: #f7faf8;
        }

        tbody.stock-rows tr:hover td {
            background: #eaf4ed;
        }

        .text-cell {
            text-align: left;
        }

        .number-cell {
            text-align: right;
            white-space: nowrap;
        }

        .money-cell {
            text-align: right;
            white-space: nowrap;
        }

        .integer-cell {
            text-align: center;
            white-space: nowrap;
        }

        .center-cell {
            text-align: center;
        }

        .wrap-cell {
            white-space: normal;
            word-wrap: break-word;
        }

        .status-good {
            color: #166534;
            background: #eaf5ed !important;
            font-weight: 700;
            text-align: center;
        }

        .status-warning {
            color: #92400e;
            background: #fff4d6 !important;
            font-weight: 700;
            text-align: center;
        }

        .status-danger {
            color: #991b1b;
            background: #fee2e2 !important;
            font-weight: 700;
            text-align: center;
        }

        .empty-cell {
            height: 54px;
            color: #64748b;
            text-align: center;
        }

        .sheet-tabs {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 14px;
            background: #f4f6f4;
            border-top: 1px solid #c7cec9;
        }

        .sheet-tab {
            padding: 4px 12px;
            color: #185c37;
            background: #ffffff;
            border-bottom: 2px solid #185c37;
            font-weight: 600;
        }

        @media (max-width: 760px) {
            .titlebar {
                align-items: flex-start;
                flex-direction: column;
            }

            .formula-bar {
                grid-template-columns: 58px 28px minmax(220px, 1fr);
            }
        }

        @media print {
            .titlebar,
            .ribbon,
            .formula-bar,
            .sheet-tabs {
                display: none;
            }

            .workbook {
                padding: 0;
            }

            .sheet {
                border: 0;
                box-shadow: none;
            }
        }
    </style>
</head>
<body class="{{ $isDownloadMode ? 'download-mode' : 'preview-mode' }}">
@if (! $isDownloadMode)
    <div class="excel-shell">
        <header class="titlebar">
            <div>
                <strong>JCM Inventory — Stock Management.xls</strong>
                <small>Warehouse stock, batch cost layers, expiry exposure, and reconciliation</small>
            </div>

            <div class="actions">
                <a
                    class="action"
                    href="{{ $pdfUrl }}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open PDF
                </a>

                <a class="action primary" href="{{ $excelDownloadUrl }}">
                    Download Excel
                </a>
            </div>
        </header>

        <section class="ribbon">
            <div class="ribbon-tabs">
                <span class="ribbon-tab active">Home</span>
                <span class="ribbon-tab">Insert</span>
                <span class="ribbon-tab">Page Layout</span>
                <span class="ribbon-tab">Data</span>
                <span class="ribbon-tab">View</span>
            </div>

            <div class="ribbon-content">
                <div class="ribbon-group">
                    <div class="ribbon-label">Positions</div>
                    <div class="ribbon-value">{{ number_format($summary['positions']) }}</div>
                </div>

                <div class="ribbon-group">
                    <div class="ribbon-label">Quantity</div>
                    <div class="ribbon-value">{{ number_format((float) $summary['quantity'], 3) }}</div>
                </div>

                <div class="ribbon-group">
                    <div class="ribbon-label">Inventory Value</div>
                    <div class="ribbon-value">₱{{ number_format((float) $summary['value'], 2) }}</div>
                </div>

                <div class="ribbon-group">
                    <div class="ribbon-label">Active Batches</div>
                    <div class="ribbon-value">{{ number_format($summary['active_batches']) }}</div>
                </div>

                <div class="ribbon-group">
                    <div class="ribbon-label">Expiring</div>
                    <div class="ribbon-value">{{ number_format($summary['expiring_batches']) }}</div>
                </div>

                <div class="ribbon-group">
                    <div class="ribbon-label">Generated</div>
                    <div class="ribbon-value">{{ $generatedAt->format('M d, Y h:i A') }}</div>
                </div>
            </div>
        </section>

        <div class="formula-bar">
            <div class="formula-cell">A1</div>
            <div class="formula-cell center-cell">fx</div>
            <div class="formula-cell">{{ $reportTitle }}</div>
        </div>
@endif

<main class="workbook">
    <div class="sheet">
        <table aria-label="JCM Inventory Stock Management Report">
            <colgroup>
                <col class="product">
                <col class="sku">
                <col class="category">
                <col class="branch">
                <col class="warehouse">
                <col class="quantity">
                <col class="unit">
                <col class="reorder">
                <col class="average-cost">
                <col class="total-value">
                <col class="layers">
                <col class="expiring">
                <col class="expired">
                <col class="stock-status">
                <col class="reconcile">
                <col class="last-movement">
            </colgroup>

            <thead>
                <tr>
                    <th colspan="16" class="title-cell">{{ $reportTitle }}</th>
                </tr>
                <tr>
                    <th colspan="16" class="subtitle-cell">
                        Warehouse balances, batch cost layers, expiry exposure, and reconciliation
                    </th>
                </tr>
                <tr>
                    <th colspan="2" class="meta-label">Generated</th>
                    <td colspan="4">{{ $generatedAt->format('F d, Y h:i A') }}</td>
                    <th colspan="2" class="meta-label">Prepared By</th>
                    <td colspan="8">{{ $preparedBy }}</td>
                </tr>
                <tr>
                    <th colspan="2" class="meta-label">Filters</th>
                    <td colspan="14" class="wrap-cell">
                        Search: {{ $filters['search'] ?: 'All' }} |
                        Stock: {{ $filters['status'] ?: 'All' }} |
                        Batch: {{ $filters['batch_status'] ?: 'All' }} |
                        Branch ID: {{ $filters['branch_id'] ?: 'All' }} |
                        Warehouse ID: {{ $filters['warehouse_id'] ?: 'All' }} |
                        Category ID: {{ $filters['category_id'] ?: 'All' }}
                    </td>
                </tr>
                <tr>
                    <th colspan="2" class="summary-label">Positions</th>
                    <th colspan="2" class="summary-label">Quantity</th>
                    <th colspan="2" class="summary-label">Inventory Value</th>
                    <th colspan="2" class="summary-label">Active Batches</th>
                    <th colspan="2" class="summary-label">Expiring</th>
                    <th colspan="2" class="summary-label">Expired</th>
                    <th colspan="2" class="summary-label">Mismatches</th>
                    <th colspan="2" class="summary-label">Generated Date</th>
                </tr>
                <tr>
                    <td colspan="2" class="summary-value integer-cell">{{ $summary['positions'] }}</td>
                    <td colspan="2" class="summary-value number-cell">{{ $summary['quantity'] }}</td>
                    <td colspan="2" class="summary-value money-cell">{{ $summary['value'] }}</td>
                    <td colspan="2" class="summary-value integer-cell">{{ $summary['active_batches'] }}</td>
                    <td colspan="2" class="summary-value integer-cell">{{ $summary['expiring_batches'] }}</td>
                    <td colspan="2" class="summary-value integer-cell">{{ $summary['expired_batches'] }}</td>
                    <td colspan="2" class="summary-value integer-cell">{{ $summary['mismatches'] }}</td>
                    <td colspan="2" class="summary-value">{{ $generatedAt->format('Y-m-d') }}</td>
                </tr>
                <tr class="blank-row">
                    <td colspan="16"></td>
                </tr>
                <tr>
                    <th class="header-cell">Product</th>
                    <th class="header-cell">SKU</th>
                    <th class="header-cell">Category</th>
                    <th class="header-cell">Branch</th>
                    <th class="header-cell">Warehouse</th>
                    <th class="header-cell">Quantity</th>
                    <th class="header-cell">Unit</th>
                    <th class="header-cell">Reorder</th>
                    <th class="header-cell">Average Cost</th>
                    <th class="header-cell">Total Value</th>
                    <th class="header-cell">Layers</th>
                    <th class="header-cell">Expiring</th>
                    <th class="header-cell">Expired</th>
                    <th class="header-cell">Stock Status</th>
                    <th class="header-cell">Reconcile</th>
                    <th class="header-cell">Last Movement</th>
                </tr>
            </thead>

            <tbody class="stock-rows">
                @forelse ($rows as $row)
                    @php
                        $stockStatusClass = match ($row->stock_status) {
                            'In Stock' => 'status-good',
                            'Low Stock' => 'status-warning',
                            default => 'status-danger',
                        };

                        $reconcileClass = $row->reconciliation_status === 'reconciled'
                            ? 'status-good'
                            : 'status-danger';
                    @endphp

                    <tr>
                        <td class="text-cell wrap-cell"><strong>{{ $row->product_name }}</strong></td>
                        <td class="text-cell">{{ $row->sku ?: '' }}</td>
                        <td class="text-cell wrap-cell">{{ $row->category_name ?: 'Uncategorized' }}</td>
                        <td class="text-cell wrap-cell">{{ $row->branch_name ?: '' }}</td>
                        <td class="text-cell wrap-cell">{{ $row->warehouse_name }} ({{ $row->warehouse_code }})</td>
                        <td class="number-cell">{{ number_format((float) $row->quantity, 3, '.', '') }}</td>
                        <td class="text-cell center-cell">{{ $row->unit }}</td>
                        <td class="number-cell">{{ number_format((float) $row->reorder_level, 3, '.', '') }}</td>
                        <td class="money-cell">{{ number_format((float) $row->average_cost, 2, '.', '') }}</td>
                        <td class="money-cell">{{ number_format((float) $row->total_value, 2, '.', '') }}</td>
                        <td class="integer-cell">{{ (int) $row->batch_count }}</td>
                        <td class="integer-cell">{{ (int) $row->expiring_batch_count }}</td>
                        <td class="integer-cell">{{ (int) $row->expired_batch_count }}</td>
                        <td class="{{ $stockStatusClass }}">{{ $row->stock_status }}</td>
                        <td class="{{ $reconcileClass }}">{{ ucfirst($row->reconciliation_status) }}</td>
                        <td class="text-cell center-cell">
                            {{ $row->last_movement_at
                                ? \Carbon\Carbon::parse($row->last_movement_at)->format('Y-m-d H:i')
                                : '' }}
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="16" class="empty-cell">
                            No stock positions matched the selected filters.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</main>

@if (! $isDownloadMode)
        <div class="sheet-tabs">
            <span class="sheet-tab">Stock Management</span>
        </div>
    </div>
@endif
</body>
</html>