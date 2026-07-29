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
    <title>Category Directory Spreadsheet</title>
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
            <strong>Category Directory Spreadsheet</strong>
            <small>Preview the filtered report before downloading the Excel file.</small>
        </div>
        <div class="actions">
            <a class="action" href="{{ $pdfUrl }}" target="_blank" rel="noopener">Open PDF</a>
            <a class="action" href="{{ $excelDownloadUrl }}">Download Excel</a>
        </div>
    </div>
    <div class="workbook">
@endif
<table>
    <tr><td colspan="8" class="title-cell">JCM Inventory — Category Directory</td></tr>
    <tr><td colspan="8" class="subtitle-cell">Category hierarchy, usage, ordering, and status</td></tr>
    <tr>
        <td class="meta-label">Generated</td>
        <td colspan="3">{{ $generatedAt->format('M d, Y h:i A') }}</td>
        <td class="meta-label">Prepared by</td>
        <td colspan="3">{{ $generatedBy }}</td>
    </tr>
    <tr>
        <td class="meta-label">Filters</td>
        <td colspan="7">{{ count($filterLabels) > 0 ? implode(' · ', $filterLabels) : 'All category records' }}</td>
    </tr>
    <tr>
        @foreach (['Total', 'Active', 'Inactive', 'Root', 'Nested', 'In Use'] as $label)
            <td class="summary-label">{{ $label }}</td>
        @endforeach
        <td class="summary-label" colspan="2">Report Scope</td>
    </tr>
    <tr>
        <td class="summary-value">{{ $summary['total'] }}</td>
        <td class="summary-value">{{ $summary['active'] }}</td>
        <td class="summary-value">{{ $summary['inactive'] }}</td>
        <td class="summary-value">{{ $summary['root'] }}</td>
        <td class="summary-value">{{ $summary['nested'] }}</td>
        <td class="summary-value">{{ $summary['used'] }}</td>
        <td class="summary-value" colspan="2">Filtered Category Directory</td>
    </tr>
    <tr>
        <th class="header-cell">No.</th>
        <th class="header-cell">Category</th>
        <th class="header-cell">Slug</th>
        <th class="header-cell">Parent</th>
        <th class="header-cell">Description</th>
        <th class="header-cell">Products</th>
        <th class="header-cell">Children / Order</th>
        <th class="header-cell">Status</th>
    </tr>
    @forelse ($categories as $index => $category)
        <tr>
            <td class="data-cell center">{{ $index + 1 }}</td>
            <td class="data-cell">{{ $category->name }}</td>
            <td class="data-cell text-cell">{{ $category->slug }}</td>
            <td class="data-cell">{{ $category->parent?->name ?? 'Root category' }}</td>
            <td class="data-cell">{{ $category->description ?: '—' }}</td>
            <td class="data-cell center">{{ $category->products_count }}</td>
            <td class="data-cell center">{{ $category->children_count }} / {{ $category->sort_order }}</td>
            <td class="{{ $category->is_active ? 'status-green' : 'status-amber' }}">
                {{ $category->is_active ? 'Active' : 'Inactive' }}
            </td>
        </tr>
    @empty
        <tr><td colspan="8" class="data-cell center">No category records matched the selected filters.</td></tr>
    @endforelse
</table>
@if (! $isDownloadMode)
    </div>
@endif
</body>
</html>
