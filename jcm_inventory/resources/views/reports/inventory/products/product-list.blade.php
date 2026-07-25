@php
    $filterText = count($filterLabels)
        ? implode('  •  ', $filterLabels)
        : 'All product records';
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Product Directory Report</title>

    <style>
        @page {
            size: A4 landscape;
            margin: 10mm 9mm 14mm 9mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #172033;
            background: #ffffff;
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 7.1px;
            line-height: 1.35;
        }

        .page-footer {
            position: fixed;
            right: 0;
            bottom: -9mm;
            left: 0;
            padding-top: 4px;
            border-top: 1px solid #d7e0e8;
            color: #7b8794;
            font-size: 5.8px;
            text-align: center;
        }

        .header-table {
            width: 100%;
            margin-bottom: 7px;
            border-collapse: collapse;
        }

        .header-table td {
            padding: 0;
            vertical-align: bottom;
        }

        .brand {
            margin: 0 0 2px;
            color: #0f766e;
            font-size: 6.2px;
            font-weight: 700;
            letter-spacing: 1.2px;
            text-transform: uppercase;
        }

        .title {
            margin: 0;
            color: #0f172a;
            font-size: 17px;
            line-height: 1.05;
        }

        .subtitle {
            margin: 4px 0 0;
            max-width: 600px;
            color: #64748b;
            font-size: 6.8px;
        }

        .meta {
            width: 270px;
            color: #475569;
            font-size: 6.4px;
            line-height: 1.65;
            text-align: right;
        }

        .meta strong {
            color: #0f172a;
        }

        .accent-line {
            height: 3px;
            margin-bottom: 7px;
            background: #0f766e;
        }

        .filter-bar {
            width: 100%;
            margin-bottom: 7px;
            border: 1px solid #d7e0e8;
            border-collapse: collapse;
            background: #f8fafc;
        }

        .filter-bar td {
            padding: 5px 7px;
            vertical-align: middle;
        }

        .filter-label {
            width: 86px;
            color: #0f172a;
            font-size: 6px;
            font-weight: 700;
            letter-spacing: .45px;
            text-transform: uppercase;
        }

        .filter-value {
            color: #475569;
        }

        .summary-table {
            width: 100%;
            margin: 0 0 7px;
            border-collapse: separate;
            border-spacing: 4px 0;
        }

        .summary-table td {
            width: 20%;
            padding: 5px 7px;
            border: 1px solid #d7e0e8;
            background: #ffffff;
            vertical-align: top;
        }

        .summary-label {
            color: #64748b;
            font-size: 5.7px;
            font-weight: 700;
            letter-spacing: .45px;
            text-transform: uppercase;
        }

        .summary-value {
            margin-top: 2px;
            color: #0f172a;
            font-size: 10.5px;
            font-weight: 700;
        }

        .summary-note {
            margin-top: 1px;
            color: #94a3b8;
            font-size: 5.5px;
        }

        .directory-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .directory-table thead {
            display: table-header-group;
        }

        .directory-table tr {
            page-break-inside: avoid;
        }

        .directory-table th,
        .directory-table td {
            padding: 4px 3.6px;
            border: 1px solid #d7e0e8;
            vertical-align: top;
            overflow-wrap: anywhere;
        }

        .directory-table th {
            color: #ffffff;
            background: #0f766e;
            font-size: 5.8px;
            font-weight: 700;
            letter-spacing: .25px;
            text-align: left;
            text-transform: uppercase;
        }

        .directory-table tbody tr:nth-child(even) td {
            background: #f8fafc;
        }

        .directory-table tbody tr:nth-child(odd) td {
            background: #ffffff;
        }

        .center {
            text-align: center;
        }

        .right {
            text-align: right;
            white-space: nowrap;
        }

        .product-name {
            color: #0f172a;
            font-size: 7.4px;
            font-weight: 700;
        }

        .detail {
            margin-top: 1.5px;
            color: #64748b;
            font-size: 5.9px;
            line-height: 1.35;
        }

        .mono {
            font-family: DejaVu Sans Mono, monospace;
            font-size: 5.8px;
        }

        .location + .location {
            margin-top: 3px;
            padding-top: 3px;
            border-top: 1px dotted #cbd5e1;
        }

        .location-branch {
            color: #0f172a;
            font-weight: 700;
        }

        .location-warehouse {
            margin-top: 1px;
            color: #475569;
        }

        .tag {
            display: inline-block;
            padding: 1px 4px;
            border: 1px solid #cbd5e1;
            border-radius: 7px;
            font-size: 5.4px;
            font-weight: 700;
            white-space: nowrap;
        }

        .tag-active {
            color: #166534;
            border-color: #bbf7d0;
            background: #f0fdf4;
        }

        .tag-inactive {
            color: #991b1b;
            border-color: #fecaca;
            background: #fef2f2;
        }

        .tag-tracked {
            color: #075985;
            border-color: #bae6fd;
            background: #f0f9ff;
        }

        .tag-not-tracked {
            color: #92400e;
            border-color: #fde68a;
            background: #fffbeb;
        }

        .empty {
            padding: 24px !important;
            color: #64748b;
            text-align: center;
        }

        .report-note {
            margin-top: 6px;
            padding: 5px 7px;
            color: #64748b;
            background: #f8fafc;
            border-left: 2px solid #0f766e;
            font-size: 5.8px;
        }
    </style>
</head>
<body>
    <footer class="page-footer">
        JCM Inventory · Product Directory · Generated {{ $generatedAt->format('M d, Y h:i A') }}
    </footer>

    <table class="header-table">
        <tr>
            <td>
                <p class="brand">JCM Inventory</p>
                <h1 class="title">Product Directory</h1>
                <p class="subtitle">
                    Product identity, classification, pricing, tracking configuration, and assigned branch or warehouse locations.
                </p>
            </td>
            <td class="meta">
                <strong>Generated:</strong> {{ $generatedAt->format('F d, Y h:i A') }}<br>
                <strong>Generated by:</strong> {{ $generatedBy }}<br>
                <strong>Matching records:</strong> {{ number_format($summary['total']) }}
            </td>
        </tr>
    </table>

    <div class="accent-line"></div>

    <table class="filter-bar">
        <tr>
            <td class="filter-label">Filters</td>
            <td class="filter-value">{{ $filterText }}</td>
        </tr>
    </table>

    <table class="summary-table">
        <tr>
            <td>
                <div class="summary-label">Products</div>
                <div class="summary-value">{{ number_format($summary['total']) }}</div>
                <div class="summary-note">Matching records</div>
            </td>
            <td>
                <div class="summary-label">Active / Inactive</div>
                <div class="summary-value">
                    {{ number_format($summary['active']) }} / {{ number_format($summary['inactive']) }}
                </div>
                <div class="summary-note">Catalog availability</div>
            </td>
            <td>
                <div class="summary-label">Categories Used</div>
                <div class="summary-value">{{ number_format($summary['categories_used']) }}</div>
                <div class="summary-note">
                    {{ number_format($summary['uncategorized']) }} uncategorized
                </div>
            </td>
            <td>
                <div class="summary-label">Warehouse Assigned</div>
                <div class="summary-value">{{ number_format($summary['with_warehouse']) }}</div>
                <div class="summary-note">
                    {{ number_format($summary['without_warehouse']) }} unassigned
                </div>
            </td>
            <td>
                <div class="summary-label">Warehouses Used</div>
                <div class="summary-value">{{ number_format($summary['warehouses_used']) }}</div>
                <div class="summary-note">Distinct locations</div>
            </td>
        </tr>
    </table>

    <table class="directory-table">
        <colgroup>
            <col style="width: 3%;">
            <col style="width: 17%;">
            <col style="width: 10%;">
            <col style="width: 12%;">
            <col style="width: 5%;">
            <col style="width: 7.5%;">
            <col style="width: 7.5%;">
            <col style="width: 7.5%;">
            <col style="width: 8%;">
            <col style="width: 15%;">
            <col style="width: 7.5%;">
        </colgroup>
        <thead>
            <tr>
                <th class="center">No.</th>
                <th>Product</th>
                <th>SKU / Barcode</th>
                <th>Category</th>
                <th class="center">Unit</th>
                <th class="right">Cost Price</th>
                <th class="right">Selling Price</th>
                <th class="right">Wholesale</th>
                <th>Tracking</th>
                <th>Branch / Warehouse</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($products as $index => $product)
                @php
                    $warehouseLocations = collect(
                        $product->getAttribute('report_warehouses') ?? []
                    );
                @endphp
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td>
                        <div class="product-name">{{ $product->name }}</div>
                        <div class="detail">
                            {{ $product->description ?: 'No description provided' }}
                        </div>
                    </td>
                    <td>
                        <div class="mono">SKU: {{ $product->sku ?: '—' }}</div>
                        <div class="detail mono">Barcode: {{ $product->barcode ?: '—' }}</div>
                    </td>
                    <td>
                        <div class="product-name">
                            {{ $product->category?->name ?? 'Uncategorized' }}
                        </div>
                        @if ($product->category)
                            <div class="detail mono">
                                {{ $product->category->slug ?: 'No slug' }}
                            </div>
                            <div class="detail">
                                Category {{ $product->category->is_active ? 'active' : 'inactive' }}
                            </div>
                        @else
                            <div class="detail">No category assigned</div>
                        @endif
                    </td>
                    <td class="center">{{ $product->unit ?: '—' }}</td>
                    <td class="right">{{ number_format((float) $product->cost_price, 2) }}</td>
                    <td class="right">{{ number_format((float) $product->selling_price, 2) }}</td>
                    <td class="right">
                        {{ $product->wholesale_price !== null
                            ? number_format((float) $product->wholesale_price, 2)
                            : '—' }}
                    </td>
                    <td>
                        <span class="tag {{ $product->stock_tracking === 'tracked' ? 'tag-tracked' : 'tag-not-tracked' }}">
                            {{ $product->stock_tracking === 'tracked' ? 'Tracked' : 'Not tracked' }}
                        </span>
                    </td>
                    <td>
                        @forelse ($warehouseLocations as $location)
                            <div class="location">
                                <div class="location-branch">
                                    {{ $location->branch_name }}
                                    @if ($location->branch_code)
                                        ({{ $location->branch_code }})
                                    @endif
                                </div>
                                <div class="location-warehouse">
                                    {{ $location->warehouse_name }}
                                    @if ($location->warehouse_code)
                                        ({{ $location->warehouse_code }})
                                    @endif
                                    @if ($location->warehouse_is_main)
                                        · Main warehouse
                                    @endif
                                </div>
                            </div>
                        @empty
                            <span class="detail">No warehouse assigned</span>
                        @endforelse
                    </td>
                    <td>
                        <span class="tag {{ $product->is_active ? 'tag-active' : 'tag-inactive' }}">
                            {{ $product->is_active ? 'Active' : 'Inactive' }}
                        </span>
                        <div class="detail">
                            Created {{ optional($product->created_at)->format('M d, Y') ?: '—' }}
                        </div>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="11" class="empty">
                        No product records matched the selected filters.
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="report-note">
        Product-directory report only. Current quantities, stock movements, and inventory valuation are intentionally excluded and remain available in their dedicated inventory pages.
    </div>
</body>
</html>