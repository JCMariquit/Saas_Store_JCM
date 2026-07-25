<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $reportTitle }}</title>
    <style>
        @page { margin: 22px 24px; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #1f2937; font-family: DejaVu Sans, sans-serif; font-size: 8px; }
        .header { border-bottom: 2px solid #14532d; padding-bottom: 10px; margin-bottom: 10px; }
        .title { color: #14532d; font-size: 16px; font-weight: 700; margin: 0; }
        .subtitle { color: #6b7280; font-size: 8px; margin-top: 4px; }
        .meta { width: 100%; margin-top: 8px; border-collapse: collapse; }
        .meta td { padding: 2px 0; vertical-align: top; }
        .meta .label { color: #6b7280; width: 75px; }
        .summary { width: 100%; margin: 10px 0; border-collapse: separate; border-spacing: 5px 0; }
        .summary td { border: 1px solid #d1d5db; background: #f8fafc; padding: 7px; }
        .summary .s-label { color: #6b7280; font-size: 7px; text-transform: uppercase; }
        .summary .s-value { color: #14532d; font-size: 12px; font-weight: 700; margin-top: 3px; }
        table.data { width: 100%; border-collapse: collapse; table-layout: fixed; }
        table.data th { background: #14532d; color: white; border: 1px solid #0f3d22; padding: 5px 4px; font-size: 7px; text-align: left; }
        table.data td { border: 1px solid #d1d5db; padding: 4px; vertical-align: top; word-wrap: break-word; }
        table.data tr:nth-child(even) td { background: #f8fafc; }
        .num { text-align: right; }
        .center { text-align: center; }
        .status { font-weight: 700; }
        .muted { color: #6b7280; }
        .footer { margin-top: 8px; color: #6b7280; font-size: 7px; text-align: right; }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">{{ $reportTitle }}</h1>
        <div class="subtitle">Warehouse stock positions, weighted acquisition value, batch layers, expiry exposure, and reconciliation.</div>

        <table class="meta">
            <tr>
                <td class="label">Generated:</td>
                <td>{{ $generatedAt->format('F d, Y h:i A') }}</td>
                <td class="label">Prepared by:</td>
                <td>{{ $preparedBy }}</td>
            </tr>
            <tr>
                <td class="label">Filters:</td>
                <td colspan="3">
                    Search: {{ $filters['search'] ?: 'All' }} |
                    Stock: {{ $filters['status'] ?: 'All' }} |
                    Batch: {{ $filters['batch_status'] ?: 'All' }} |
                    Branch ID: {{ $filters['branch_id'] ?: 'All' }} |
                    Warehouse ID: {{ $filters['warehouse_id'] ?: 'All' }} |
                    Category ID: {{ $filters['category_id'] ?: 'All' }}
                </td>
            </tr>
        </table>
    </div>

    <table class="summary">
        <tr>
            <td><div class="s-label">Positions</div><div class="s-value">{{ number_format($summary['positions']) }}</div></td>
            <td><div class="s-label">Quantity</div><div class="s-value">{{ number_format($summary['quantity'], 3) }}</div></td>
            <td><div class="s-label">Inventory Value</div><div class="s-value">PHP {{ number_format($summary['value'], 2) }}</div></td>
            <td><div class="s-label">Active Layers</div><div class="s-value">{{ number_format($summary['active_batches']) }}</div></td>
            <td><div class="s-label">Expiring</div><div class="s-value">{{ number_format($summary['expiring_batches']) }}</div></td>
            <td><div class="s-label">Expired</div><div class="s-value">{{ number_format($summary['expired_batches']) }}</div></td>
            <td><div class="s-label">Mismatches</div><div class="s-value">{{ number_format($summary['mismatches']) }}</div></td>
        </tr>
    </table>

    <table class="data">
        <thead>
            <tr>
                <th style="width: 13%">Product</th>
                <th style="width: 7%">SKU</th>
                <th style="width: 8%">Category</th>
                <th style="width: 8%">Branch</th>
                <th style="width: 9%">Warehouse</th>
                <th style="width: 6%" class="num">Quantity</th>
                <th style="width: 5%">Unit</th>
                <th style="width: 6%" class="num">Reorder</th>
                <th style="width: 7%" class="num">Avg. Cost</th>
                <th style="width: 8%" class="num">Value</th>
                <th style="width: 5%" class="center">Layers</th>
                <th style="width: 5%" class="center">Expiring</th>
                <th style="width: 5%" class="center">Expired</th>
                <th style="width: 7%">Status</th>
                <th style="width: 7%">Reconcile</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $row)
                <tr>
                    <td><strong>{{ $row->product_name }}</strong><br><span class="muted">{{ $row->barcode ?: 'No barcode' }}</span></td>
                    <td>{{ $row->sku ?: '—' }}</td>
                    <td>{{ $row->category_name ?: 'Uncategorized' }}</td>
                    <td>{{ $row->branch_name ?: '—' }}</td>
                    <td>{{ $row->warehouse_name }}<br><span class="muted">{{ $row->warehouse_code }}</span></td>
                    <td class="num">{{ number_format((float) $row->quantity, 3) }}</td>
                    <td>{{ $row->unit }}</td>
                    <td class="num">{{ number_format((float) $row->reorder_level, 3) }}</td>
                    <td class="num">{{ number_format((float) $row->average_cost, 4) }}</td>
                    <td class="num">{{ number_format((float) $row->total_value, 2) }}</td>
                    <td class="center">{{ number_format((int) $row->batch_count) }}</td>
                    <td class="center">{{ number_format((int) $row->expiring_batch_count) }}</td>
                    <td class="center">{{ number_format((int) $row->expired_batch_count) }}</td>
                    <td class="status">{{ $row->stock_status }}</td>
                    <td>{{ ucfirst($row->reconciliation_status) }}</td>
                </tr>
            @empty
                <tr><td colspan="15" class="center">No stock positions matched the selected filters.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">JCM Inventory • {{ $generatedAt->format('Y-m-d H:i:s') }}</div>
</body>
</html>