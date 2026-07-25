<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Product Directory</title>
    <style>
        @page {
            margin: 10mm 8mm 14mm 8mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #172033;
            font-family: DejaVu Sans, sans-serif;
            font-size: 7.4px;
            line-height: 1.35;
        }

        .header {
            display: table;
            width: 100%;
            margin-bottom: 7px;
            border-bottom: 2px solid #166534;
            padding-bottom: 6px;
        }

        .header-left,
        .header-right {
            display: table-cell;
            vertical-align: top;
        }

        .header-right {
            width: 33%;
            text-align: right;
        }

        .brand {
            margin: 0;
            color: #166534;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: -0.2px;
        }

        .title {
            margin: 2px 0 0;
            font-size: 10px;
            font-weight: 700;
        }

        .subtitle,
        .meta {
            margin: 2px 0 0;
            color: #64748b;
            font-size: 6.8px;
        }

        .filter-line {
            margin-bottom: 7px;
            border: 1px solid #dbe4dc;
            background: #f5faf6;
            padding: 5px 7px;
        }

        .filter-label {
            color: #166534;
            font-weight: 700;
        }

        .summary {
            display: table;
            width: 100%;
            margin-bottom: 7px;
            table-layout: fixed;
            border: 1px solid #dbe4dc;
        }

        .summary-cell {
            display: table-cell;
            padding: 5px 6px;
            border-right: 1px solid #dbe4dc;
            background: #fbfdfb;
        }

        .summary-cell:last-child {
            border-right: 0;
        }

        .summary-label {
            color: #64748b;
            font-size: 6.2px;
            text-transform: uppercase;
        }

        .summary-value {
            margin-top: 1px;
            color: #166534;
            font-size: 10px;
            font-weight: 700;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        thead {
            display: table-header-group;
        }

        tr {
            page-break-inside: avoid;
        }

        th {
            border: 1px solid #b7c8ba;
            background: #166534;
            color: #ffffff;
            padding: 4px 3px;
            font-size: 6.2px;
            font-weight: 700;
            text-align: left;
            text-transform: uppercase;
        }

        td {
            border: 1px solid #d9e1db;
            padding: 4px 3px;
            vertical-align: top;
            word-wrap: break-word;
        }

        tbody tr:nth-child(even) td {
            background: #f8faf8;
        }

        .center {
            text-align: center;
        }

        .right {
            text-align: right;
        }

        .strong {
            font-weight: 700;
        }

        .muted {
            color: #64748b;
        }

        .mono {
            font-family: DejaVu Sans Mono, monospace;
            font-size: 6.4px;
        }

        .tag {
            display: inline-block;
            margin: 0 2px 2px 0;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 1px 4px;
            background: #f8fafc;
            color: #334155;
            font-size: 5.8px;
            font-weight: 700;
        }

        .tag-green {
            border-color: #86c89a;
            background: #eef9f1;
            color: #166534;
        }

        .tag-amber {
            border-color: #e6c56c;
            background: #fff8df;
            color: #92400e;
        }

        .tag-gray {
            border-color: #cbd5e1;
            background: #f1f5f9;
            color: #64748b;
        }

        .footer {
            position: fixed;
            right: 0;
            bottom: -9mm;
            left: 0;
            border-top: 1px solid #dbe4dc;
            padding-top: 3px;
            color: #64748b;
            font-size: 6.2px;
        }

        .page-number::after {
            content: counter(page);
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <p class="brand">JCM Inventory</p>
            <p class="title">Product Directory and Batch Configuration</p>
            <p class="subtitle">
                Product identity, default cost reference, stock tracking, batch policy, expiry rules, and warehouse assignment.
            </p>
        </div>
        <div class="header-right">
            <p class="meta"><span class="strong">Generated:</span> {{ $generatedAt->format('M d, Y h:i A') }}</p>
            <p class="meta"><span class="strong">Prepared by:</span> {{ $generatedBy }}</p>
            <p class="meta"><span class="strong">Records:</span> {{ number_format($summary['total']) }}</p>
        </div>
    </div>

    <div class="filter-line">
        <span class="filter-label">Applied filters:</span>
        {{ count($filterLabels) > 0 ? implode(' · ', $filterLabels) : 'All product records' }}
    </div>

    <div class="summary">
        <div class="summary-cell">
            <div class="summary-label">Products</div>
            <div class="summary-value">{{ number_format($summary['total']) }}</div>
        </div>
        <div class="summary-cell">
            <div class="summary-label">Active</div>
            <div class="summary-value">{{ number_format($summary['active']) }}</div>
        </div>
        <div class="summary-cell">
            <div class="summary-label">Stock tracked</div>
            <div class="summary-value">{{ number_format($summary['tracked']) }}</div>
        </div>
        <div class="summary-cell">
            <div class="summary-label">Batch enabled</div>
            <div class="summary-value">{{ number_format($summary['batch_enabled']) }}</div>
        </div>
        <div class="summary-cell">
            <div class="summary-label">Expiry required</div>
            <div class="summary-value">{{ number_format($summary['expiration_required']) }}</div>
        </div>
        <div class="summary-cell">
            <div class="summary-label">With warehouse</div>
            <div class="summary-value">{{ number_format($summary['with_warehouse']) }}</div>
        </div>
    </div>

    <table>
        <colgroup>
            <col style="width: 2.5%">
            <col style="width: 10.5%">
            <col style="width: 8.5%">
            <col style="width: 7.5%">
            <col style="width: 7.5%">
            <col style="width: 6.5%">
            <col style="width: 4%">
            <col style="width: 6.5%">
            <col style="width: 6%">
            <col style="width: 7%">
            <col style="width: 5.5%">
            <col style="width: 8%">
            <col style="width: 13.5%">
            <col style="width: 6.5%">
        </colgroup>
        <thead>
            <tr>
                <th class="center">#</th>
                <th>Product</th>
                <th>Description</th>
                <th>SKU</th>
                <th>Barcode</th>
                <th>Category</th>
                <th>Unit</th>
                <th class="right">Default Cost</th>
                <th>Stock</th>
                <th>Batch</th>
                <th>Policy</th>
                <th>Expiry Rule</th>
                <th>Branch / Warehouse Assignment</th>
                <th>Status / Updated</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($products as $index => $product)
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td>
                        <div class="strong">{{ $product->name }}</div>
                        <div class="muted mono">ID #{{ $product->id }}</div>
                    </td>
                    <td>{{ $product->description ?: '—' }}</td>
                    <td class="mono">{{ $product->sku ?: '—' }}</td>
                    <td class="mono">{{ $product->barcode ?: '—' }}</td>
                    <td>
                        <div>{{ $product->category?->name ?? 'Uncategorized' }}</div>
                        @if ($product->category?->description)
                            <div class="muted">{{ $product->category->description }}</div>
                        @endif
                    </td>
                    <td class="center">{{ $product->unit }}</td>
                    <td class="right">{{ number_format((float) $product->cost_price, 2) }}</td>
                    <td>
                        <span class="tag {{ $product->stock_tracking === 'tracked' ? 'tag-green' : 'tag-gray' }}">
                            {{ $product->stock_tracking === 'tracked' ? 'Tracked' : 'Not tracked' }}
                        </span>
                    </td>
                    <td>
                        <span class="tag {{ $product->batch_tracking_enabled ? 'tag-green' : 'tag-gray' }}">
                            {{ $product->batch_tracking_enabled ? 'Enabled' : 'Disabled' }}
                        </span>
                    </td>
                    <td>
                        {{ $product->batch_tracking_enabled
                            ? strtoupper($product->batch_issue_policy)
                            : '—' }}
                    </td>
                    <td>
                        @if ($product->batch_tracking_enabled)
                            <span class="tag {{ $product->requires_expiration_date ? 'tag-amber' : 'tag-gray' }}">
                                {{ $product->requires_expiration_date ? 'Required' : 'Optional' }}
                            </span>
                            <div class="muted">
                                Warning: {{ $product->expiry_warning_days
                                    ? $product->expiry_warning_days.' days'
                                    : 'Tenant default' }}
                            </div>
                        @else
                            —
                        @endif
                    </td>
                    <td>{{ $product->report_warehouse_text }}</td>
                    <td>
                        <span class="tag {{ $product->is_active ? 'tag-green' : 'tag-gray' }}">
                            {{ $product->is_active ? 'Active' : 'Inactive' }}
                        </span>
                        <div class="muted">
                            {{ optional($product->updated_at)->format('M d, Y') ?? '—' }}
                        </div>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="14" class="center">No products matched the selected filters.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <span>JCM Inventory · Product master report · No current stock quantities, movements, or valuation totals are included.</span>
        <span style="float: right;">Page <span class="page-number"></span></span>
    </div>
</body>
</html>