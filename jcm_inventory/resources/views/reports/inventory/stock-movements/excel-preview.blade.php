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
    <title>Stock Movement Spreadsheet</title>
    <style>
        @if ($isDownloadMode)
            
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
            }

            .header-cell {
                height: 30px;
                background: #185c37;
                color: #ffffff;
                font-size: 9pt;
                font-weight: 700;
                text-align: center;
            }

            .data-cell {
                background: #ffffff;
                color: #172033;
                font-size: 9pt;
            }

            .center {
                text-align: center;
            }

            .right,
            .number-cell {
                text-align: right;
            }

            .text-cell {
                mso-number-format: "\\@";
            }

            .number-cell {
                mso-number-format: "#,##0.00";
            }

            .status-green {
                background: #eaf5ed;
                color: #166534;
                font-weight: 700;
                text-align: center;
            }

            .status-red {
                background: #fff1f1;
                color: #991b1b;
                font-weight: 700;
                text-align: center;
            }

            .status-amber {
                background: #fff8df;
                color: #92400e;
                font-weight: 700;
                text-align: center;
            }

        @else
            
            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                background: #e7ebe8;
                color: #172033;
                font-family: Calibri, Arial, sans-serif;
                font-size: 12px;
            }

            .titlebar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 16px;
                min-height: 46px;
                padding: 8px 14px;
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
                border: 1px solid rgba(255, 255, 255, 0.28);
                border-radius: 4px;
                padding: 7px 10px;
                background: rgba(255, 255, 255, 0.1);
                color: #ffffff;
                font-size: 11px;
                font-weight: 700;
                text-decoration: none;
            }

            .workbook {
                width: calc(100% - 24px);
                margin: 12px auto;
                border: 1px solid #aeb8b1;
                background: #ffffff;
                box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
            }

            table {
                width: 100%;
                border-collapse: collapse;
                table-layout: fixed;
            }

            th,
            td {
                border: 1px solid #c4cdc7;
                padding: 6px 7px;
                vertical-align: middle;
            }

            .title-cell {
                background: #185c37;
                color: #ffffff;
                font-size: 16px;
                font-weight: 700;
                text-align: left;
            }

            .subtitle-cell {
                background: #e2f0d9;
                color: #185c37;
                font-size: 11px;
                font-weight: 600;
            }

            .meta-label {
                width: 125px;
                background: #f1f5f2;
                color: #475569;
                font-weight: 700;
            }

            .summary-label {
                background: #d9ead3;
                color: #185c37;
                font-size: 10px;
                font-weight: 700;
                text-align: center;
            }

            .summary-value {
                background: #eef6ef;
                color: #172033;
                font-size: 12px;
                font-weight: 700;
                text-align: center;
            }

            .header-cell {
                background: #185c37;
                color: #ffffff;
                font-size: 10px;
                font-weight: 700;
                text-align: center;
            }

            .data-cell {
                background: #ffffff;
                color: #172033;
                font-size: 10px;
            }

            tbody tr:nth-child(even) .data-cell {
                background: #f7faf8;
            }

            .center {
                text-align: center;
            }

            .right {
                text-align: right;
            }

            .text-cell {
                mso-number-format: "\\@";
            }

            .number-cell {
                mso-number-format: "#,##0.00";
                text-align: right;
            }

            .status-green {
                background: #eaf5ed !important;
                color: #166534;
                font-weight: 700;
                text-align: center;
            }

            .status-red {
                background: #fff1f1 !important;
                color: #991b1b;
                font-weight: 700;
                text-align: center;
            }

            .status-amber {
                background: #fff8df !important;
                color: #92400e;
                font-weight: 700;
                text-align: center;
            }

            .muted {
                color: #64748b;
            }

        @endif
    </style>
</head>
<body>
@if (! $isDownloadMode)
    <div class="titlebar">
        <div>
            <strong>Stock Movement History Spreadsheet</strong>
            <small>Preview the filtered inventory audit ledger before downloading.</small>
        </div>
        <div class="actions">
            <a class="action" href="{{ $pdfUrl }}" target="_blank" rel="noopener">Open PDF</a>
            <a class="action" href="{{ $excelDownloadUrl }}">Download Excel</a>
        </div>
    </div>
    <div class="workbook">
@endif
<table>
    <tr><td colspan="13" class="title-cell">JCM Inventory — Stock Movement History</td></tr>
    <tr><td colspan="13" class="subtitle-cell">Inventory inflow, outflow, routing, quantity balances, values, and audit ownership</td></tr>
    <tr>
        <td class="meta-label">Generated</td>
        <td colspan="5">{{ $generatedAt->format('M d, Y h:i A') }}</td>
        <td class="meta-label">Prepared by</td>
        <td colspan="6">{{ $generatedBy }}</td>
    </tr>
    <tr>
        <td class="meta-label">Filters</td>
        <td colspan="12">{{ count($filterLabels) > 0 ? implode(' · ', $filterLabels) : 'All stock movement records' }}</td>
    </tr>
    <tr>
        <td class="summary-label" colspan="2">Movements</td>
        <td class="summary-label" colspan="2">Incoming Qty.</td>
        <td class="summary-label" colspan="2">Outgoing Qty.</td>
        <td class="summary-label" colspan="2">Products</td>
        <td class="summary-label" colspan="5">Movement Value</td>
    </tr>
    <tr>
        <td class="summary-value" colspan="2">{{ $summary['total'] }}</td>
        <td class="summary-value" colspan="2">{{ number_format($summary['incoming_quantity'], 3) }}</td>
        <td class="summary-value" colspan="2">{{ number_format($summary['outgoing_quantity'], 3) }}</td>
        <td class="summary-value" colspan="2">{{ $summary['affected_products'] }}</td>
        <td class="summary-value" colspan="5">PHP {{ number_format($summary['movement_value'], 2) }}</td>
    </tr>
    <tr>
        <th class="header-cell">No.</th>
        <th class="header-cell">Date</th>
        <th class="header-cell">Product</th>
        <th class="header-cell">SKU</th>
        <th class="header-cell">Warehouse</th>
        <th class="header-cell">Related Warehouse</th>
        <th class="header-cell">Movement</th>
        <th class="header-cell">Direction</th>
        <th class="header-cell">Quantity</th>
        <th class="header-cell">Before</th>
        <th class="header-cell">After</th>
        <th class="header-cell">Value</th>
        <th class="header-cell">Reference / User</th>
    </tr>
    @forelse ($movements as $index => $movement)
        <tr>
            <td class="data-cell center">{{ $index + 1 }}</td>
            <td class="data-cell center">{{ \Illuminate\Support\Carbon::parse($movement->movement_date)->format('M d, Y h:i A') }}</td>
            <td class="data-cell">{{ $movement->product_name ?: 'Deleted product' }}</td>
            <td class="data-cell text-cell">{{ $movement->product_sku ?: '—' }}</td>
            <td class="data-cell">{{ $movement->warehouse_name ?: 'Deleted warehouse' }}</td>
            <td class="data-cell">{{ $movement->related_warehouse_name ?: '—' }}</td>
            <td class="data-cell">{{ $movement->movement_label }}</td>
            <td class="{{ $movement->direction === 'in' ? 'status-green' : 'status-red' }}">
                {{ strtoupper($movement->direction) }}
            </td>
            <td class="data-cell number-cell">{{ number_format(abs($movement->quantity), 3, '.', '') }}</td>
            <td class="data-cell number-cell">{{ number_format($movement->quantity_before, 3, '.', '') }}</td>
            <td class="data-cell number-cell">{{ number_format($movement->quantity_after, 3, '.', '') }}</td>
            <td class="data-cell number-cell">{{ number_format(abs($movement->total_cost), 2, '.', '') }}</td>
            <td class="data-cell">{{ $movement->reference_no ?: 'Movement #'.$movement->id }} — {{ $movement->created_by_name }}</td>
        </tr>
    @empty
        <tr><td colspan="13" class="data-cell center">No stock movement records matched the selected filters.</td></tr>
    @endforelse
</table>
@if (! $isDownloadMode)
    </div>
@endif
</body>
</html>
