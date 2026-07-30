@php
    $formatValue = static function (mixed $value, string $format = 'text'): string {
        if ($value === null || $value === '') {
            return '—';
        }

        return match ($format) {
            'money' => '₱'.number_format((float) $value, 2),
            'quantity' => number_format((float) $value, 3),
            'integer' => number_format((int) $value),
            'date' => \Carbon\Carbon::parse($value)->format('M d, Y'),
            'datetime' => \Carbon\Carbon::parse($value)->format('M d, Y h:i A'),
            default => (string) $value,
        };
    };
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $title }}</title>
    <style>
        @page { margin: 10mm 8mm 14mm 8mm; }
        * { box-sizing: border-box; }
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
        .header-left, .header-right { display: table-cell; vertical-align: top; }
        .header-right { width: 34%; text-align: right; }
        .brand { margin: 0; color: #166534; font-size: 15px; font-weight: 700; }
        .title { margin: 2px 0 0; font-size: 10px; font-weight: 700; }
        .subtitle, .meta { margin: 2px 0 0; color: #64748b; font-size: 6.7px; }
        .strong { font-weight: 700; }
        .filter-line {
            margin-bottom: 7px;
            border: 1px solid #dbe4dc;
            background: #f5faf6;
            padding: 5px 7px;
        }
        .filter-label { color: #166534; font-weight: 700; }
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
        .summary-cell:last-child { border-right: 0; }
        .summary-label { color: #64748b; font-size: 6.2px; text-transform: uppercase; }
        .summary-value { margin-top: 1px; color: #166534; font-size: 10px; font-weight: 700; }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        thead { display: table-header-group; }
        tr { page-break-inside: avoid; }
        th {
            border: 1px solid #b7c8ba;
            background: #166534;
            color: #ffffff;
            padding: 4px 3px;
            font-size: 6.1px;
            font-weight: 700;
            text-align: left;
            text-transform: uppercase;
        }
        td {
            border: 1px solid #d9e1db;
            padding: 4px 3px;
            vertical-align: top;
            word-wrap: break-word;
            white-space: pre-line;
        }
        tbody tr:nth-child(even) td { background: #f8faf8; }
        .center { text-align: center; }
        .right { text-align: right; }
        .status {
            display: inline-block;
            border: 1px solid #b7c8ba;
            border-radius: 7px;
            padding: 1px 4px;
            background: #eef9f1;
            color: #166534;
            font-size: 5.8px;
            font-weight: 700;
        }
        .empty { padding: 18px 8px; text-align: center; color: #64748b; }
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
        .page-number::after { content: counter(page); }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <p class="brand">JCM Inventory</p>
            <p class="title">{{ $title }}</p>
            <p class="subtitle">{{ $subtitle }}</p>
        </div>
        <div class="header-right">
            <p class="meta"><span class="strong">Generated:</span> {{ $generatedAt->format('M d, Y h:i A') }}</p>
            <p class="meta"><span class="strong">Prepared by:</span> {{ $generatedBy }}</p>
            <p class="meta"><span class="strong">Records:</span> {{ number_format(count($rows)) }}</p>
        </div>
    </div>

    <div class="filter-line">
        <span class="filter-label">Applied filters:</span>
        {{ count($filterLabels) > 0 ? implode(' · ', $filterLabels) : 'All available procurement records' }}
    </div>

    <div class="summary">
        @foreach ($summary as $item)
            <div class="summary-cell">
                <div class="summary-label">{{ $item['label'] }}</div>
                <div class="summary-value">{{ $formatValue($item['value'], $item['format'] ?? 'integer') }}</div>
            </div>
        @endforeach
    </div>

    <table>
        <colgroup>
            @foreach ($columns as $column)
                <col style="width: {{ $column['width'] ?? 'auto' }}">
            @endforeach
        </colgroup>
        <thead>
            <tr>
                @foreach ($columns as $column)
                    <th class="{{ $column['align'] ?? '' }}">{{ $column['label'] }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $row)
                <tr>
                    @foreach ($columns as $column)
                        @php
                            $value = $row[$column['key']] ?? null;
                            $format = $column['format'] ?? 'text';
                        @endphp
                        <td class="{{ $column['align'] ?? '' }}">
                            @if ($format === 'status')
                                <span class="status">{{ $formatValue($value) }}</span>
                            @else
                                {{ $formatValue($value, $format) }}
                            @endif
                        </td>
                    @endforeach
                </tr>
            @empty
                <tr>
                    <td colspan="{{ count($columns) }}" class="empty">No records match the selected filters.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        JCM Inventory · {{ $title }} · Page <span class="page-number"></span>
    </div>
</body>
</html>
