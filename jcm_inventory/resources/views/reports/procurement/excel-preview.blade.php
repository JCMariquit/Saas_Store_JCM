@php
    $isDownloadMode = !empty($downloadMode);

    $displayValue = static function (mixed $value, string $format = 'text', bool $rawNumber = false): string|int|float {
        if ($value === null || $value === '') {
            return '—';
        }

        if ($rawNumber && in_array($format, ['money', 'quantity', 'integer'], true)) {
            return $format === 'integer' ? (int) $value : (float) $value;
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
    $summaryBaseSpan = max(1, intdiv(count($columns), max(1, count($summary))));
    $summaryRemainder = max(0, count($columns) - ($summaryBaseSpan * count($summary)));
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
    <title>{{ $title }} Spreadsheet</title>
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            background: {{ $isDownloadMode ? '#ffffff' : '#e7ebe8' }};
            color: #172033;
            font-family: Calibri, Arial, sans-serif;
            font-size: {{ $isDownloadMode ? '10pt' : '12px' }};
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
        .titlebar strong { font-size: 13px; }
        .titlebar small { display: block; margin-top: 2px; color: #d7eadf; font-size: 10px; }
        .actions { display: flex; flex-wrap: wrap; gap: 7px; }
        .action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 29px;
            border: 1px solid rgba(255,255,255,.35);
            border-radius: 4px;
            padding: 5px 10px;
            background: rgba(255,255,255,.1);
            color: #ffffff;
            font-size: 11px;
            font-weight: 600;
            text-decoration: none;
        }
        .action.primary { background: #ffffff; color: #185c37; }
        .ribbon {
            border-bottom: 1px solid #c7cec9;
            background: #f8faf8;
            padding: 9px 14px;
        }
        .ribbon-grid { display: flex; flex-wrap: wrap; gap: 18px; }
        .ribbon-item { min-width: 145px; border-right: 1px solid #d8ddd9; padding-right: 18px; }
        .ribbon-label { color: #64748b; font-size: 9px; text-transform: uppercase; }
        .ribbon-value { margin-top: 3px; font-size: 11px; font-weight: 600; }
        .sheet-wrap { padding: {{ $isDownloadMode ? '0' : '16px' }}; overflow: auto; }
        .sheet {
            min-width: 980px;
            border: 1px solid #b8c3bc;
            background: #ffffff;
            box-shadow: {{ $isDownloadMode ? 'none' : '0 12px 30px rgba(15,23,42,.08)' }};
        }
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        th, td { border: 1px solid #b8c3bc; padding: 5px 7px; vertical-align: middle; }
        .title-cell { background: #185c37; color: #ffffff; font-size: 16pt; font-weight: 700; }
        .subtitle-cell { background: #e2f0d9; color: #185c37; font-size: 10pt; font-weight: 600; }
        .meta-label { width: 130px; background: #f1f5f2; color: #475569; font-weight: 700; }
        .meta-value { background: #ffffff; color: #334155; }
        .summary-label { background: #d9ead3; color: #185c37; font-size: 9pt; font-weight: 700; text-align: center; }
        .summary-value { background: #eef6ef; color: #172033; font-size: 11pt; font-weight: 700; text-align: center; }
        .header-cell { background: #185c37; color: #ffffff; font-size: 9pt; font-weight: 700; text-align: center; }
        .data-cell { background: #ffffff; color: #172033; font-size: 9pt; white-space: pre-line; word-wrap: break-word; }
        .alt-row { background: #f7faf8; }
        .center-cell { text-align: center; }
        .number-cell { text-align: right; mso-number-format: "#,##0.000"; }
        .money-cell { text-align: right; mso-number-format: '₱#,##0.00'; }
        .integer-cell { text-align: right; mso-number-format: "0"; }
        .status-cell { background: #eaf5ed; color: #166534; font-weight: 700; text-align: center; }
        .empty { padding: 18px; text-align: center; color: #64748b; }
        @if ($isDownloadMode)
            @page { margin: .35in; }
        @endif
    </style>
</head>
<body>
    @unless ($isDownloadMode)
        <div class="titlebar">
            <div>
                <strong>{{ $title }}</strong>
                <small>Spreadsheet preview · {{ number_format(count($rows)) }} record{{ count($rows) === 1 ? '' : 's' }}</small>
            </div>
            <div class="actions">
                <a class="action" href="{{ $pdfUrl }}" target="_blank" rel="noopener noreferrer">Open PDF</a>
                <a class="action primary" href="{{ $excelDownloadUrl }}">Download Excel</a>
            </div>
        </div>
        <div class="ribbon">
            <div class="ribbon-grid">
                <div class="ribbon-item">
                    <div class="ribbon-label">Prepared by</div>
                    <div class="ribbon-value">{{ $generatedBy }}</div>
                </div>
                <div class="ribbon-item">
                    <div class="ribbon-label">Generated</div>
                    <div class="ribbon-value">{{ $generatedAt->format('M d, Y h:i A') }}</div>
                </div>
                <div class="ribbon-item">
                    <div class="ribbon-label">Filters</div>
                    <div class="ribbon-value">{{ count($filterLabels) > 0 ? implode(' · ', $filterLabels) : 'All available records' }}</div>
                </div>
            </div>
        </div>
    @endunless

    <div class="sheet-wrap">
        <div class="sheet">
            <table>
                <tr>
                    <td colspan="{{ count($columns) }}" class="title-cell">JCM Inventory — {{ $title }}</td>
                </tr>
                <tr>
                    <td colspan="{{ count($columns) }}" class="subtitle-cell">{{ $subtitle }}</td>
                </tr>
                <tr>
                    <td class="meta-label">Generated</td>
                    <td colspan="{{ max(1, count($columns) - 1) }}" class="meta-value">{{ $generatedAt->format('M d, Y h:i A') }}</td>
                </tr>
                <tr>
                    <td class="meta-label">Prepared by</td>
                    <td colspan="{{ max(1, count($columns) - 1) }}" class="meta-value">{{ $generatedBy }}</td>
                </tr>
                <tr>
                    <td class="meta-label">Applied filters</td>
                    <td colspan="{{ max(1, count($columns) - 1) }}" class="meta-value">{{ count($filterLabels) > 0 ? implode(' · ', $filterLabels) : 'All available procurement records' }}</td>
                </tr>
                <tr>
                    @foreach ($summary as $summaryIndex => $item)
                        <td colspan="{{ $summaryBaseSpan + ($summaryIndex === count($summary) - 1 ? $summaryRemainder : 0) }}" class="summary-label">{{ $item['label'] }}</td>
                    @endforeach
                </tr>
                <tr>
                    @foreach ($summary as $summaryIndex => $item)
                        <td colspan="{{ $summaryBaseSpan + ($summaryIndex === count($summary) - 1 ? $summaryRemainder : 0) }}" class="summary-value">
                            {{ $displayValue($item['value'], $item['format'] ?? 'integer', $isDownloadMode) }}
                        </td>
                    @endforeach
                </tr>
                <tr><td colspan="{{ count($columns) }}" style="height:7px;border:0;background:#ffffff;padding:0"></td></tr>
                <tr>
                    @foreach ($columns as $column)
                        <th class="header-cell">{{ $column['label'] }}</th>
                    @endforeach
                </tr>
                @forelse ($rows as $rowIndex => $row)
                    <tr>
                        @foreach ($columns as $column)
                            @php
                                $format = $column['format'] ?? 'text';
                                $value = $row[$column['key']] ?? null;
                                $class = match ($format) {
                                    'money' => 'money-cell',
                                    'quantity' => 'number-cell',
                                    'integer' => 'integer-cell',
                                    'status' => 'status-cell',
                                    default => ($column['align'] ?? '') === 'center' ? 'center-cell' : '',
                                };
                            @endphp
                            <td class="data-cell {{ $rowIndex % 2 === 1 ? 'alt-row' : '' }} {{ $class }}">
                                {{ $displayValue($value, $format, $isDownloadMode) }}
                            </td>
                        @endforeach
                    </tr>
                @empty
                    <tr>
                        <td colspan="{{ count($columns) }}" class="empty">No records match the selected filters.</td>
                    </tr>
                @endforelse
            </table>
        </div>
    </div>
</body>
</html>
