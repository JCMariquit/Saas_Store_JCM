@php
    $isDownloadMode = !empty($downloadMode);
@endphp
<!DOCTYPE html>
<html lang="en"
    @if ($isDownloadMode)
        xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns="http://www.w3.org/TR/REC-html40"
    @endif
>
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Directory Spreadsheet</title>

    @if ($isDownloadMode)
        <style>
            @page {
                margin: 0.35in;
            }

            body {
                margin: 0;
                background: #ffffff;
                color: #172033;
                font-family: Calibri, Arial, sans-serif;
                font-size: 10pt;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
                mso-displayed-decimal-separator: ".";
                mso-displayed-thousand-separator: ",";
            }

            th,
            td {
                border: 1px solid #b8c3bc;
                padding: 5px 7px;
                vertical-align: middle;
            }

            .title-cell {
                height: 34px;
                background: #185c37;
                color: #ffffff;
                font-size: 16pt;
                font-weight: 700;
                text-align: left;
            }

            .subtitle-cell {
                height: 24px;
                background: #e2f0d9;
                color: #185c37;
                font-size: 10pt;
                font-weight: 600;
                text-align: left;
            }

            .meta-label {
                width: 120px;
                background: #f1f5f2;
                color: #475569;
                font-weight: 700;
                text-align: left;
            }

            .meta-value {
                background: #ffffff;
                color: #334155;
                text-align: left;
            }

            .summary-label {
                background: #d9ead3;
                color: #185c37;
                font-size: 9pt;
                font-weight: 700;
                text-align: center;
            }

            .summary-value {
                background: #eef6ef;
                color: #172033;
                font-size: 11pt;
                font-weight: 700;
                text-align: center;
                mso-number-format: "0";
            }

            .spacer-cell {
                height: 7px;
                border: 0;
                background: #ffffff;
                padding: 0;
            }

            .header-cell {
                height: 30px;
                background: #185c37;
                color: #ffffff;
                font-size: 9pt;
                font-weight: 700;
                text-align: center;
                white-space: normal;
            }

            .data-cell {
                min-height: 22px;
                background: #ffffff;
                color: #172033;
                font-size: 9pt;
                text-align: left;
            }

            .alt-row {
                background: #f7faf8;
            }

            .product-name {
                font-weight: 700;
            }

            .secondary-text {
                color: #64748b;
                font-size: 8pt;
            }

            .wrap-cell {
                white-space: normal;
                word-wrap: break-word;
            }

            .text-cell {
                mso-number-format: "\\@";
                white-space: nowrap;
            }

            .center-cell {
                text-align: center;
                white-space: nowrap;
            }

            .number-cell {
                text-align: right;
                white-space: nowrap;
                mso-number-format: "#,##0.00";
            }

            .active-cell,
            .enabled-cell,
            .tracked-cell {
                background: #eaf5ed;
                color: #166534;
                font-weight: 700;
                text-align: center;
                white-space: nowrap;
            }

            .inactive-cell,
            .disabled-cell,
            .not-tracked-cell {
                background: #f1f5f9;
                color: #64748b;
                font-weight: 700;
                text-align: center;
                white-space: nowrap;
            }

            .warning-cell {
                background: #fff4d6;
                color: #92400e;
                font-weight: 700;
                text-align: center;
                white-space: nowrap;
            }

            .note-cell {
                background: #fffbea;
                color: #7c5b13;
                font-size: 8pt;
                font-style: italic;
                text-align: left;
            }
        </style>
    @else
        <style>
            * {
                box-sizing: border-box;
            }

            html,
            body {
                min-height: 100%;
            }

            body {
                margin: 0;
                background: #e7ebe8;
                color: #172033;
                font-family: Calibri, Arial, sans-serif;
                font-size: 12px;
            }

            .excel-shell {
                min-height: 100vh;
            }

            .titlebar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                min-height: 44px;
                padding: 7px 14px;
                background: #185c37;
                color: #ffffff;
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
                min-height: 29px;
                border: 1px solid rgba(255, 255, 255, 0.35);
                border-radius: 4px;
                padding: 5px 10px;
                background: rgba(255, 255, 255, 0.1);
                color: #ffffff;
                font-size: 11px;
                font-weight: 600;
                text-decoration: none;
            }

            .action.primary {
                background: #ffffff;
                color: #185c37;
            }

            .ribbon {
                border-bottom: 1px solid #c7cec9;
                background: #f8faf8;
            }

            .ribbon-tabs {
                display: flex;
                gap: 2px;
                border-bottom: 1px solid #d8ddd9;
                padding: 0 12px;
            }

            .ribbon-tab {
                padding: 8px 11px 6px;
                color: #334155;
                font-size: 11px;
            }

            .ribbon-tab.active {
                border-bottom: 2px solid #185c37;
                color: #185c37;
                font-weight: 700;
            }

            .ribbon-content {
                display: flex;
                flex-wrap: wrap;
                gap: 18px;
                padding: 8px 14px;
            }

            .ribbon-group {
                min-width: 140px;
                border-right: 1px solid #d8ddd9;
                padding-right: 18px;
            }

            .ribbon-label {
                color: #64748b;
                font-size: 9px;
                text-transform: uppercase;
            }

            .ribbon-value {
                margin-top: 3px;
                font-size: 11px;
                font-weight: 600;
            }

            .formula-bar {
                display: grid;
                grid-template-columns: 70px 30px minmax(280px, 1fr);
                border-bottom: 1px solid #c7cec9;
                background: #ffffff;
            }

            .formula-cell {
                min-height: 28px;
                border-right: 1px solid #d8ddd9;
                padding: 6px 8px;
            }

            .formula-cell:last-child {
                border-right: 0;
            }

            .workbook {
                overflow: auto;
                padding: 12px;
            }

            .sheet {
                min-width: 1710px;
                border: 1px solid #aeb8b1;
                background: #ffffff;
                box-shadow: 0 2px 7px rgba(15, 23, 42, 0.12);
            }

            table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
            }

            col.row-number { width: 44px; }
            col.product { width: 175px; }
            col.description { width: 220px; }
            col.sku { width: 110px; }
            col.barcode { width: 125px; }
            col.category { width: 150px; }
            col.unit { width: 70px; }
            col.cost { width: 110px; }
            col.stock { width: 110px; }
            col.batch { width: 110px; }
            col.policy { width: 90px; }
            col.expiry { width: 125px; }
            col.warning { width: 115px; }
            col.location { width: 280px; }
            col.status { width: 90px; }
            col.updated { width: 135px; }

            th,
            td {
                border: 1px solid #d6dcd8;
                padding: 6px 8px;
                vertical-align: top;
                word-wrap: break-word;
            }

            .column-letters th {
                height: 23px;
                padding: 3px;
                background: #f1f3f2;
                color: #475569;
                font-size: 10px;
                font-weight: 600;
                text-align: center;
            }

            .corner,
            .row-index {
                background: #f1f3f2;
                color: #64748b;
                font-size: 10px;
                font-weight: 400;
                text-align: center;
            }

            .report-title td {
                padding: 10px;
                background: #e2f0d9;
                color: #185c37;
                font-size: 15px;
                font-weight: 700;
            }

            .report-subtitle td,
            .report-meta td,
            .report-filter td,
            .report-summary td {
                padding: 7px 10px;
            }

            .report-subtitle td {
                color: #475569;
                font-size: 11px;
            }

            .report-meta td,
            .report-filter td {
                background: #f8faf8;
                color: #475569;
            }

            .report-summary td {
                background: #eef6ef;
                color: #185c37;
                font-weight: 600;
            }

            .headers th {
                background: #185c37;
                color: #ffffff;
                font-size: 10px;
                font-weight: 700;
                text-align: left;
                text-transform: uppercase;
            }

            tbody.data tr:nth-child(even) td:not(.row-index) {
                background: #f8faf8;
            }

            .money {
                text-align: right;
                white-space: nowrap;
            }

            .center {
                text-align: center;
            }

            .mono {
                font-family: Consolas, monospace;
                font-size: 10px;
            }

            .muted {
                color: #64748b;
                font-size: 10px;
            }

            .cell-active,
            .cell-enabled,
            .cell-tracked {
                background: #eaf5ed !important;
                color: #166534;
                font-weight: 600;
                text-align: center;
            }

            .cell-disabled,
            .cell-inactive,
            .cell-not-tracked {
                background: #f1f5f9 !important;
                color: #64748b;
                font-weight: 600;
                text-align: center;
            }

            .cell-warning {
                background: #fff7dd !important;
                color: #92400e;
                font-weight: 600;
                text-align: center;
            }

            .sheet-tabs {
                display: flex;
                align-items: center;
                gap: 8px;
                border-top: 1px solid #c7cec9;
                background: #f4f6f4;
                padding: 6px 14px;
            }

            .sheet-tab {
                border-bottom: 2px solid #185c37;
                padding: 4px 12px;
                background: #ffffff;
                color: #185c37;
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
        </style>
    @endif
</head>
<body>
@if ($isDownloadMode)
    <table aria-label="JCM Inventory Product Directory">
        <colgroup>
            <col style="width: 175px;">
            <col style="width: 245px;">
            <col style="width: 110px;">
            <col style="width: 125px;">
            <col style="width: 160px;">
            <col style="width: 72px;">
            <col style="width: 115px;">
            <col style="width: 115px;">
            <col style="width: 115px;">
            <col style="width: 90px;">
            <col style="width: 110px;">
            <col style="width: 105px;">
            <col style="width: 290px;">
            <col style="width: 90px;">
            <col style="width: 145px;">
        </colgroup>

        <tr>
            <td colspan="15" class="title-cell">
                JCM Inventory — Product Directory and Batch Configuration
            </td>
        </tr>
        <tr>
            <td colspan="15" class="subtitle-cell">
                Product master, default unit cost reference, stock tracking, batch policy, expiry controls, and warehouse assignment
            </td>
        </tr>
        <tr>
            <td class="meta-label">Generated</td>
            <td colspan="5" class="meta-value">{{ $generatedAt->format('M d, Y h:i A') }}</td>
            <td class="meta-label">Prepared by</td>
            <td colspan="8" class="meta-value">{{ $generatedBy }}</td>
        </tr>
        <tr>
            <td class="meta-label">Applied filters</td>
            <td colspan="14" class="meta-value">
                {{ count($filterLabels) > 0 ? implode(' · ', $filterLabels) : 'All product records' }}
            </td>
        </tr>
        <tr>
            <td colspan="15" class="spacer-cell"></td>
        </tr>

        <tr>
            <td colspan="2" class="summary-label">Products</td>
            <td colspan="2" class="summary-label">Active</td>
            <td colspan="2" class="summary-label">Stock Tracked</td>
            <td colspan="2" class="summary-label">Batch Enabled</td>
            <td colspan="2" class="summary-label">Expiry Required</td>
            <td colspan="2" class="summary-label">With Warehouse</td>
            <td colspan="3" class="summary-label">Uncategorized</td>
        </tr>
        <tr>
            <td colspan="2" class="summary-value">{{ $summary['total'] }}</td>
            <td colspan="2" class="summary-value">{{ $summary['active'] }}</td>
            <td colspan="2" class="summary-value">{{ $summary['tracked'] }}</td>
            <td colspan="2" class="summary-value">{{ $summary['batch_enabled'] }}</td>
            <td colspan="2" class="summary-value">{{ $summary['expiration_required'] }}</td>
            <td colspan="2" class="summary-value">{{ $summary['with_warehouse'] }}</td>
            <td colspan="3" class="summary-value">{{ $summary['uncategorized'] }}</td>
        </tr>
        <tr>
            <td colspan="15" class="spacer-cell"></td>
        </tr>

        <tr>
            <th class="header-cell">Product</th>
            <th class="header-cell">Description</th>
            <th class="header-cell">SKU</th>
            <th class="header-cell">Barcode</th>
            <th class="header-cell">Category</th>
            <th class="header-cell">Unit</th>
            <th class="header-cell">Default Unit Cost</th>
            <th class="header-cell">Stock Tracking</th>
            <th class="header-cell">Batch Tracking</th>
            <th class="header-cell">Issue Policy</th>
            <th class="header-cell">Expiry Rule</th>
            <th class="header-cell">Warning Days</th>
            <th class="header-cell">Branch / Warehouse Assignment</th>
            <th class="header-cell">Status</th>
            <th class="header-cell">Last Updated</th>
        </tr>

        @forelse ($products as $index => $product)
            @php
                $rowClass = $index % 2 === 1 ? ' alt-row' : '';
            @endphp
            <tr>
                <td class="data-cell wrap-cell{{ $rowClass }}">
                    <span class="product-name">{{ $product->name }}</span><br>
                    <span class="secondary-text">Product ID: {{ $product->id }}</span>
                </td>
                <td class="data-cell wrap-cell{{ $rowClass }}">{{ $product->description ?: '—' }}</td>
                <td class="data-cell text-cell{{ $rowClass }}">{{ $product->sku ?: '—' }}</td>
                <td class="data-cell text-cell{{ $rowClass }}">{{ $product->barcode ?: '—' }}</td>
                <td class="data-cell wrap-cell{{ $rowClass }}">
                    {{ $product->category?->name ?? 'Uncategorized' }}
                    @if ($product->category?->description)
                        <br><span class="secondary-text">{{ $product->category->description }}</span>
                    @endif
                </td>
                <td class="data-cell center-cell{{ $rowClass }}">{{ $product->unit }}</td>
                <td class="data-cell number-cell{{ $rowClass }}">{{ number_format((float) $product->cost_price, 2, '.', '') }}</td>
                <td class="{{ $product->stock_tracking === 'tracked' ? 'tracked-cell' : 'not-tracked-cell' }}">
                    {{ $product->stock_tracking === 'tracked' ? 'Tracked' : 'Not tracked' }}
                </td>
                <td class="{{ $product->batch_tracking_enabled ? 'enabled-cell' : 'disabled-cell' }}">
                    {{ $product->batch_tracking_enabled ? 'Enabled' : 'Disabled' }}
                </td>
                <td class="data-cell center-cell{{ $rowClass }}">
                    {{ $product->batch_tracking_enabled ? strtoupper($product->batch_issue_policy) : '—' }}
                </td>
                <td class="{{ $product->requires_expiration_date ? 'warning-cell' : 'data-cell center-cell'.$rowClass }}">
                    {{ $product->batch_tracking_enabled
                        ? ($product->requires_expiration_date ? 'Required' : 'Optional')
                        : '—' }}
                </td>
                <td class="data-cell center-cell{{ $rowClass }}">
                    {{ $product->batch_tracking_enabled
                        ? ($product->expiry_warning_days ?: 'Tenant default')
                        : '—' }}
                </td>
                <td class="data-cell wrap-cell{{ $rowClass }}">{{ $product->report_warehouse_text }}</td>
                <td class="{{ $product->is_active ? 'active-cell' : 'inactive-cell' }}">
                    {{ $product->is_active ? 'Active' : 'Inactive' }}
                </td>
                <td class="data-cell center-cell{{ $rowClass }}">
                    {{ optional($product->updated_at)->format('M d, Y h:i A') ?? '—' }}
                </td>
            </tr>
        @empty
            <tr>
                <td colspan="15" class="data-cell center-cell">No products matched the selected filters.</td>
            </tr>
        @endforelse

        <tr>
            <td colspan="15" class="note-cell">
                Note: Default Unit Cost is a product reference only. Actual inventory valuation is derived from receiving, batch costs, stock movements, and warehouse average cost.
            </td>
        </tr>
    </table>
@else
    <div class="excel-shell">
        <header class="titlebar">
            <div>
                <strong>JCM Inventory — Product Directory.xls</strong>
                <small>Product master and batch-control configuration</small>
            </div>

            <div class="actions">
                <a class="action" href="{{ $pdfUrl }}" target="_blank" rel="noopener">Open PDF</a>
                <a class="action primary" href="{{ $excelDownloadUrl }}">Download Excel</a>
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
                    <div class="ribbon-label">Records</div>
                    <div class="ribbon-value">{{ number_format($summary['total']) }} products</div>
                </div>
                <div class="ribbon-group">
                    <div class="ribbon-label">Stock tracked</div>
                    <div class="ribbon-value">{{ number_format($summary['tracked']) }}</div>
                </div>
                <div class="ribbon-group">
                    <div class="ribbon-label">Batch enabled</div>
                    <div class="ribbon-value">{{ number_format($summary['batch_enabled']) }}</div>
                </div>
                <div class="ribbon-group">
                    <div class="ribbon-label">Expiry required</div>
                    <div class="ribbon-value">{{ number_format($summary['expiration_required']) }}</div>
                </div>
                <div class="ribbon-group">
                    <div class="ribbon-label">Generated</div>
                    <div class="ribbon-value">{{ $generatedAt->format('M d, Y h:i A') }}</div>
                </div>
            </div>
        </section>

        <div class="formula-bar">
            <div class="formula-cell">A1</div>
            <div class="formula-cell center">fx</div>
            <div class="formula-cell">Product Directory and Batch Configuration</div>
        </div>

        <main class="workbook">
            <div class="sheet">
                <table>
                    <colgroup>
                        <col class="row-number">
                        <col class="product">
                        <col class="description">
                        <col class="sku">
                        <col class="barcode">
                        <col class="category">
                        <col class="unit">
                        <col class="cost">
                        <col class="stock">
                        <col class="batch">
                        <col class="policy">
                        <col class="expiry">
                        <col class="warning">
                        <col class="location">
                        <col class="status">
                        <col class="updated">
                    </colgroup>

                    <thead>
                        <tr class="column-letters">
                            <th class="corner"></th>
                            @foreach (range('A', 'O') as $letter)
                                <th>{{ $letter }}</th>
                            @endforeach
                        </tr>
                        <tr class="report-title">
                            <td class="row-index">1</td>
                            <td colspan="15">JCM Inventory — Product Directory and Batch Configuration</td>
                        </tr>
                        <tr class="report-subtitle">
                            <td class="row-index">2</td>
                            <td colspan="15">
                                Product identity, default unit cost reference, stock tracking, batch policy, expiry controls, and branch / warehouse assignment
                            </td>
                        </tr>
                        <tr class="report-meta">
                            <td class="row-index">3</td>
                            <td colspan="15">
                                Generated {{ $generatedAt->format('M d, Y h:i A') }} · Prepared by {{ $generatedBy }}
                            </td>
                        </tr>
                        <tr class="report-filter">
                            <td class="row-index">4</td>
                            <td colspan="15">
                                Applied filters: {{ count($filterLabels) > 0 ? implode(' · ', $filterLabels) : 'All product records' }}
                            </td>
                        </tr>
                        <tr class="report-summary">
                            <td class="row-index">5</td>
                            <td colspan="15">
                                Products: {{ number_format($summary['total']) }} · Active: {{ number_format($summary['active']) }} · Stock tracked: {{ number_format($summary['tracked']) }} · Batch enabled: {{ number_format($summary['batch_enabled']) }} · Expiry required: {{ number_format($summary['expiration_required']) }} · With warehouse: {{ number_format($summary['with_warehouse']) }}
                            </td>
                        </tr>
                        <tr class="headers">
                            <th class="row-index">6</th>
                            <th>Product</th>
                            <th>Description</th>
                            <th>SKU</th>
                            <th>Barcode</th>
                            <th>Category</th>
                            <th>Unit</th>
                            <th>Default Cost</th>
                            <th>Stock Tracking</th>
                            <th>Batch Tracking</th>
                            <th>Issue Policy</th>
                            <th>Expiry Rule</th>
                            <th>Warning Days</th>
                            <th>Branch / Warehouse Assignment</th>
                            <th>Status</th>
                            <th>Updated</th>
                        </tr>
                    </thead>

                    <tbody class="data">
                        @forelse ($products as $index => $product)
                            <tr>
                                <td class="row-index">{{ $index + 7 }}</td>
                                <td>
                                    <strong>{{ $product->name }}</strong>
                                    <div class="muted">ID #{{ $product->id }}</div>
                                </td>
                                <td>{{ $product->description ?: '—' }}</td>
                                <td class="mono">{{ $product->sku ?: '—' }}</td>
                                <td class="mono">{{ $product->barcode ?: '—' }}</td>
                                <td>
                                    {{ $product->category?->name ?? 'Uncategorized' }}
                                    @if ($product->category?->description)
                                        <div class="muted">{{ $product->category->description }}</div>
                                    @endif
                                </td>
                                <td class="center">{{ $product->unit }}</td>
                                <td class="money">{{ number_format((float) $product->cost_price, 2) }}</td>
                                <td class="{{ $product->stock_tracking === 'tracked' ? 'cell-tracked' : 'cell-not-tracked' }}">
                                    {{ $product->stock_tracking === 'tracked' ? 'Tracked' : 'Not tracked' }}
                                </td>
                                <td class="{{ $product->batch_tracking_enabled ? 'cell-enabled' : 'cell-disabled' }}">
                                    {{ $product->batch_tracking_enabled ? 'Enabled' : 'Disabled' }}
                                </td>
                                <td class="center">
                                    {{ $product->batch_tracking_enabled ? strtoupper($product->batch_issue_policy) : '—' }}
                                </td>
                                <td class="{{ $product->requires_expiration_date ? 'cell-warning' : '' }}">
                                    {{ $product->batch_tracking_enabled
                                        ? ($product->requires_expiration_date ? 'Required' : 'Optional')
                                        : '—' }}
                                </td>
                                <td class="center">
                                    {{ $product->batch_tracking_enabled
                                        ? ($product->expiry_warning_days ?: 'Tenant default')
                                        : '—' }}
                                </td>
                                <td>{{ $product->report_warehouse_text }}</td>
                                <td class="{{ $product->is_active ? 'cell-active' : 'cell-inactive' }}">
                                    {{ $product->is_active ? 'Active' : 'Inactive' }}
                                </td>
                                <td>{{ optional($product->updated_at)->format('M d, Y h:i A') ?? '—' }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td class="row-index">7</td>
                                <td colspan="15" class="center">No products matched the selected filters.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </main>

        <footer class="sheet-tabs">
            <span class="sheet-tab">Product Directory</span>
            <span class="muted">Ready</span>
        </footer>
    </div>
@endif
</body>
</html>