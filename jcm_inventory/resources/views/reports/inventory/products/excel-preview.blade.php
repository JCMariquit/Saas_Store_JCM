@php
    $downloadMode = (bool) ($downloadMode ?? false);
    $filterText = count($filterLabels)
        ? implode(' | ', $filterLabels)
        : 'All product records';
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Directory - Excel Preview</title>

    <style>
        * {
            box-sizing: border-box;
        }

        html,
        body {
            margin: 0;
            min-height: 100%;
            color: #111111;
            background: #e8eaed;
            font-family: Calibri, Arial, sans-serif;
            font-size: 11px;
        }

        .toolbar {
            position: sticky;
            top: 0;
            z-index: 20;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            min-height: 46px;
            padding: 7px 12px;
            color: #ffffff;
            background: #217346;
            border-bottom: 1px solid #185c37;
        }

        .toolbar-title {
            display: flex;
            align-items: center;
            min-width: 0;
            gap: 9px;
            font-size: 13px;
            font-weight: 600;
        }

        .excel-mark {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            color: #ffffff;
            background: #185c37;
            border: 1px solid rgba(255, 255, 255, .35);
            font-weight: 700;
        }

        .toolbar-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
        }

        .toolbar-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 30px;
            padding: 5px 10px;
            color: #ffffff;
            background: transparent;
            border: 1px solid rgba(255, 255, 255, .65);
            cursor: pointer;
            text-decoration: none;
            font: inherit;
        }

        .toolbar-button:hover {
            background: rgba(255, 255, 255, .12);
        }

        .toolbar-button.primary {
            color: #185c37;
            background: #ffffff;
        }

        .formula-row {
            position: sticky;
            top: 46px;
            z-index: 19;
            display: grid;
            grid-template-columns: 72px 36px minmax(240px, 1fr);
            min-height: 32px;
            background: #ffffff;
            border-bottom: 1px solid #bfc3c7;
        }

        .formula-row > div {
            display: flex;
            align-items: center;
            min-height: 32px;
            padding: 4px 8px;
            border-right: 1px solid #d0d3d6;
        }

        .formula-name,
        .formula-fx {
            justify-content: center;
        }

        .formula-fx {
            color: #666666;
            font-family: Georgia, serif;
            font-style: italic;
        }

        .workbook {
            overflow: auto;
            padding: 14px;
        }

        .sheet {
            min-width: 1760px;
            background: #ffffff;
            border: 1px solid #aeb4b9;
            box-shadow: 0 2px 9px rgba(0, 0, 0, .09);
        }

        body.download-mode {
            background: #ffffff;
        }

        body.download-mode .workbook {
            padding: 0;
        }

        body.download-mode .sheet {
            border: 0;
            box-shadow: none;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            background: #ffffff;
        }

        col.no { width: 48px; }
        col.product { width: 180px; }
        col.description { width: 225px; }
        col.sku { width: 110px; }
        col.barcode { width: 125px; }
        col.category { width: 140px; }
        col.category-detail { width: 145px; }
        col.unit { width: 68px; }
        col.money { width: 98px; }
        col.tracking { width: 105px; }
        col.warehouse { width: 260px; }
        col.status { width: 82px; }
        col.date { width: 124px; }

        th,
        td {
            height: 26px;
            padding: 4px 6px;
            border: 1px solid #d9d9d9;
            overflow: hidden;
            vertical-align: middle;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .sheet-title {
            height: 36px;
            color: #ffffff;
            background: #217346;
            font-size: 16px;
            font-weight: 700;
            text-align: left;
        }

        .sheet-subtitle {
            height: 26px;
            color: #315a46;
            background: #e2f0d9;
            font-size: 11px;
            font-weight: 600;
        }

        .meta-label {
            background: #f2f2f2;
            font-weight: 700;
        }

        .meta-value {
            color: #333333;
            background: #ffffff;
        }

        .summary-label {
            color: #315a46;
            background: #e2f0d9;
            font-weight: 700;
            text-align: center;
        }

        .summary-value {
            color: #111111;
            background: #ffffff;
            font-weight: 700;
            text-align: center;
        }

        .blank-row td {
            height: 11px;
            padding: 0;
            background: #ffffff;
        }

        .column-header {
            height: 32px;
            color: #ffffff;
            background: #217346;
            font-weight: 700;
            text-align: center;
            white-space: normal;
        }

        .number,
        .money {
            text-align: right;
        }

        .center {
            text-align: center;
        }

        .wrap {
            height: auto;
            min-height: 26px;
            overflow: visible;
            text-overflow: clip;
            white-space: normal;
            word-break: break-word;
        }

        tbody.product-rows tr:nth-child(even) td {
            background: #f7fbf8;
        }

        tbody.product-rows tr:hover td {
            background: #eaf4ed;
        }

        .status-active {
            color: #166534;
            background: #dcfce7 !important;
            font-weight: 700;
        }

        .status-inactive {
            color: #991b1b;
            background: #fee2e2 !important;
            font-weight: 700;
        }

        .tracking-tracked {
            color: #075985;
            background: #e0f2fe !important;
            font-weight: 700;
        }

        .tracking-not-tracked {
            color: #92400e;
            background: #fef3c7 !important;
            font-weight: 700;
        }

        .empty-cell {
            height: 54px;
            color: #666666;
            text-align: center;
        }

        .sheet-note {
            color: #666666;
            background: #fffbe6;
            font-style: italic;
        }

        .sheet-footer {
            position: sticky;
            bottom: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-height: 33px;
            padding: 0 12px;
            color: #444444;
            background: #f5f5f5;
            border-top: 1px solid #c8c8c8;
        }

        .sheet-tab {
            min-width: 116px;
            padding: 8px 14px 7px;
            color: #185c37;
            background: #ffffff;
            border-bottom: 2px solid #217346;
            font-weight: 600;
            text-align: center;
        }

        @media (max-width: 760px) {
            .toolbar {
                align-items: flex-start;
                flex-direction: column;
            }

            .formula-row {
                top: 91px;
            }
        }

        @media print {
            .toolbar,
            .formula-row,
            .sheet-footer {
                display: none !important;
            }

            html,
            body,
            .workbook {
                margin: 0;
                padding: 0;
                background: #ffffff;
            }

            .sheet {
                border: 0;
                box-shadow: none;
            }
        }
    </style>
</head>
<body class="{{ $downloadMode ? 'download-mode' : 'preview-mode' }}">
    @unless ($downloadMode)
        <header class="toolbar">
            <div class="toolbar-title">
                <span class="excel-mark">X</span>
                <span>Product Directory.xls - Excel Preview</span>
            </div>

            <div class="toolbar-actions">
                <a
                    href="{{ $pdfUrl }}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="toolbar-button"
                >
                    Open PDF
                </a>

                <button
                    type="button"
                    class="toolbar-button"
                    onclick="window.print()"
                >
                    Print
                </button>

                <a
                    href="{{ $excelDownloadUrl }}"
                    class="toolbar-button primary"
                >
                    Download Excel
                </a>

                <button
                    type="button"
                    class="toolbar-button"
                    onclick="window.close()"
                >
                    Close
                </button>
            </div>
        </header>

        <div class="formula-row">
            <div class="formula-name">A1</div>
            <div class="formula-fx">fx</div>
            <div>JCM Inventory - Product Directory</div>
        </div>
    @endunless

    <main class="workbook">
        <div class="sheet">
            <table>
                <colgroup>
                    <col class="no">
                    <col class="product">
                    <col class="description">
                    <col class="sku">
                    <col class="barcode">
                    <col class="category">
                    <col class="category-detail">
                    <col class="unit">
                    <col class="money">
                    <col class="money">
                    <col class="money">
                    <col class="tracking">
                    <col class="warehouse">
                    <col class="status">
                    <col class="date">
                    <col class="date">
                </colgroup>

                <thead>
                    <tr>
                        <th colspan="16" class="sheet-title">
                            JCM Inventory - Product Directory
                        </th>
                    </tr>
                    <tr>
                        <th colspan="16" class="sheet-subtitle">
                            Product identity, category, pricing, tracking configuration, and branch / warehouse assignment
                        </th>
                    </tr>
                    <tr>
                        <th colspan="2" class="meta-label">Generated</th>
                        <td colspan="6" class="meta-value">
                            {{ $generatedAt->format('F d, Y h:i A') }}
                        </td>
                        <th colspan="2" class="meta-label">Generated by</th>
                        <td colspan="6" class="meta-value">
                            {{ $generatedBy }}
                        </td>
                    </tr>
                    <tr>
                        <th colspan="2" class="meta-label">Filters</th>
                        <td colspan="10" class="meta-value wrap">
                            {{ $filterText }}
                        </td>
                        <th colspan="2" class="meta-label">Records</th>
                        <td colspan="2" class="meta-value number">
                            {{ number_format($summary['total']) }}
                        </td>
                    </tr>
                    <tr>
                        <th colspan="2" class="summary-label">Active</th>
                        <td colspan="2" class="summary-value">{{ number_format($summary['active']) }}</td>
                        <th colspan="2" class="summary-label">Inactive</th>
                        <td colspan="2" class="summary-value">{{ number_format($summary['inactive']) }}</td>
                        <th colspan="2" class="summary-label">Categories Used</th>
                        <td colspan="2" class="summary-value">{{ number_format($summary['categories_used']) }}</td>
                        <th colspan="2" class="summary-label">Warehouse Assigned</th>
                        <td colspan="2" class="summary-value">{{ number_format($summary['with_warehouse']) }}</td>
                    </tr>
                    <tr class="blank-row">
                        <td colspan="16"></td>
                    </tr>
                    <tr>
                        <th class="column-header">No.</th>
                        <th class="column-header">Product</th>
                        <th class="column-header">Description</th>
                        <th class="column-header">SKU</th>
                        <th class="column-header">Barcode</th>
                        <th class="column-header">Category</th>
                        <th class="column-header">Category Details</th>
                        <th class="column-header">Unit</th>
                        <th class="column-header">Cost Price</th>
                        <th class="column-header">Selling Price</th>
                        <th class="column-header">Wholesale Price</th>
                        <th class="column-header">Stock Tracking</th>
                        <th class="column-header">Branch / Warehouse</th>
                        <th class="column-header">Status</th>
                        <th class="column-header">Created</th>
                        <th class="column-header">Updated</th>
                    </tr>
                </thead>

                <tbody class="product-rows">
                    @forelse ($products as $index => $product)
                        @php
                            $locations = collect(
                                $product->getAttribute('report_warehouses') ?? []
                            );

                            $warehouseText = $locations
                                ->map(function ($location) {
                                    $branchName = trim(
                                        (string) ($location->branch_name ?? '')
                                    );
                                    $branchCode = trim(
                                        (string) ($location->branch_code ?? '')
                                    );
                                    $warehouseName = trim(
                                        (string) ($location->warehouse_name ?? '')
                                    );
                                    $warehouseCode = trim(
                                        (string) ($location->warehouse_code ?? '')
                                    );

                                    $branch = $branchCode !== ''
                                        ? $branchName.' ('.$branchCode.')'
                                        : $branchName;

                                    $warehouse = $warehouseCode !== ''
                                        ? $warehouseName.' ('.$warehouseCode.')'
                                        : $warehouseName;

                                    return trim($branch.' / '.$warehouse, ' /');
                                })
                                ->filter()
                                ->implode('; ');

                            $categoryDetails = $product->category
                                ? (($product->category->slug ?: 'No slug')
                                    .' | '
                                    .($product->category->is_active
                                        ? 'Active'
                                        : 'Inactive'))
                                : 'Not assigned';
                        @endphp

                        <tr>
                            <td class="number">{{ $index + 1 }}</td>
                            <td>{{ $product->name }}</td>
                            <td class="wrap">{{ $product->description ?: 'No description' }}</td>
                            <td>{{ $product->sku ?: '-' }}</td>
                            <td>{{ $product->barcode ?: '-' }}</td>
                            <td>{{ $product->category?->name ?? 'Uncategorized' }}</td>
                            <td class="wrap">{{ $categoryDetails }}</td>
                            <td class="center">{{ $product->unit ?: '-' }}</td>
                            <td class="money">{{ number_format((float) $product->cost_price, 2) }}</td>
                            <td class="money">{{ number_format((float) $product->selling_price, 2) }}</td>
                            <td class="money">
                                {{ $product->wholesale_price !== null
                                    ? number_format((float) $product->wholesale_price, 2)
                                    : '-' }}
                            </td>
                            <td class="center {{ $product->stock_tracking === 'tracked' ? 'tracking-tracked' : 'tracking-not-tracked' }}">
                                {{ $product->stock_tracking === 'tracked'
                                    ? 'Tracked'
                                    : 'Not Tracked' }}
                            </td>
                            <td class="wrap">{{ $warehouseText ?: 'No warehouse assigned' }}</td>
                            <td class="center {{ $product->is_active ? 'status-active' : 'status-inactive' }}">
                                {{ $product->is_active ? 'Active' : 'Inactive' }}
                            </td>
                            <td class="center">
                                {{ optional($product->created_at)->format('M d, Y H:i') ?: '-' }}
                            </td>
                            <td class="center">
                                {{ optional($product->updated_at)->format('M d, Y H:i') ?: '-' }}
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="16" class="empty-cell">
                                No product records matched the selected filters.
                            </td>
                        </tr>
                    @endforelse
                </tbody>

                <tfoot>
                    <tr>
                        <td colspan="16" class="sheet-note">
                            Product-directory worksheet only. Current quantities, stock movements, and inventory valuation are intentionally excluded.
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </main>

    @unless ($downloadMode)
        <footer class="sheet-footer">
            <div class="sheet-tab">Product Directory</div>
            <div>
                Ready · {{ number_format($summary['total']) }}
                record{{ $summary['total'] === 1 ? '' : 's' }}
            </div>
        </footer>
    @endunless
</body>
</html>