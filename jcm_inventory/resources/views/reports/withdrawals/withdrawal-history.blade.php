<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Withdrawal History</title>
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
            font-size: 7.2px;
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
            width: 34%;
            text-align: right;
        }

        .brand {
            margin: 0;
            color: #166534;
            font-size: 15px;
            font-weight: 700;
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
            font-size: 6.6px;
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
            font-size: 6px;
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
            font-size: 6px;
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
            font-size: 6.2px;
        }

        .tag {
            display: inline-block;
            margin: 0 2px 2px 0;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 1px 4px;
            background: #f8fafc;
            color: #334155;
            font-size: 5.7px;
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

        .tag-red {
            border-color: #e8a5a5;
            background: #fff1f1;
            color: #991b1b;
        }

        .tag-blue {
            border-color: #9dc3e6;
            background: #eff6ff;
            color: #1d4ed8;
        }

        .footer {
            position: fixed;
            right: 0;
            bottom: -9mm;
            left: 0;
            border-top: 1px solid #dbe4dc;
            padding-top: 3px;
            color: #64748b;
            font-size: 6px;
        }

        .page-number::after {
            content: counter(page);
        }

        .empty {
            padding: 20px;
            text-align: center;
            color: #64748b;
        }
</style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <p class="brand">JCM Inventory</p>
            <p class="title">Stock Withdrawal History and Issuance Register</p>
            <p class="subtitle">
                Posted and voided stock issuances, recipients, warehouse sources, quantities, values, and audit ownership.
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
        {{ count($filterLabels) > 0 ? implode(' · ', $filterLabels) : 'All withdrawal records' }}
    </div>

    <div class="summary">
        @foreach ([
            'Total' => $summary['total'],
            'Posted' => $summary['posted'],
            'Voided' => $summary['voided'],
            'Quantity' => number_format($summary['quantity_issued'], 3),
            'Posted Value' => 'PHP '.number_format($summary['total_cost'], 2),
        ] as $label => $value)
            <div class="summary-cell">
                <div class="summary-label">{{ $label }}</div>
                <div class="summary-value">{{ $value }}</div>
            </div>
        @endforeach
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 4%;">No.</th>
                <th style="width: 11%;">Withdrawal</th>
                <th style="width: 8%;">Date</th>
                <th style="width: 11%;">Reason</th>
                <th style="width: 13%;">Recipient / Dept.</th>
                <th style="width: 14%;">Branch / Warehouse</th>
                <th style="width: 15%;">Items</th>
                <th style="width: 7%;">Qty.</th>
                <th style="width: 8%;">Value</th>
                <th style="width: 9%;">Status / User</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($issuances as $index => $issuance)
                <tr>
                    <td class="center">{{ $index + 1 }}</td>
                    <td>
                        <span class="strong mono">{{ $issuance->issuance_number }}</span><br>
                        <span class="muted">{{ $issuance->reference_no ?: 'No reference' }}</span>
                    </td>
                    <td class="center">{{ \Illuminate\Support\Carbon::parse($issuance->issuance_date)->format('M d, Y') }}</td>
                    <td>{{ $issuance->reason_label }}</td>
                    <td>
                        <span class="strong">{{ $issuance->issued_to ?: '—' }}</span><br>
                        <span class="muted">{{ $issuance->department ?: $issuance->purpose ?: '—' }}</span>
                    </td>
                    <td>{{ $issuance->branch_name }} / {{ $issuance->warehouse_name }}</td>
                    <td>
                        {{ $issuance->item_names ?: 'No item names' }}<br>
                        <span class="muted">{{ number_format($issuance->items_count) }} line item(s)</span>
                    </td>
                    <td class="right">{{ number_format($issuance->total_quantity, 3) }}</td>
                    <td class="right">PHP {{ number_format($issuance->total_cost, 2) }}</td>
                    <td>
                        <span class="tag {{ $issuance->status === 'posted' ? 'tag-green' : 'tag-red' }}">
                            {{ ucfirst($issuance->status) }}
                        </span><br>
                        <span class="muted">{{ $issuance->issued_by_name }}</span>
                    </td>
                </tr>
            @empty
                <tr><td colspan="10" class="empty">No withdrawal records matched the selected filters.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        JCM Inventory · Withdrawal History · Page <span class="page-number"></span>
    </div>
</body>
</html>
