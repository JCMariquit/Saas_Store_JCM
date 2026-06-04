type RadarMetric = {
    label: string;
    value: number;
};

type RadarSeries = {
    label: string;
    color?: string;
    data: RadarMetric[];
};

type Props = {
    series: RadarSeries[];
    size?: number;
    max?: number;
    formatter?: (value: number) => string;
};

const defaultColors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'];

function point(cx: number, cy: number, radius: number, index: number, total: number) {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2;

    return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
    };
}

export default function RadarChart({
    series,
    size = 320,
    max,
    formatter = (value) => value.toLocaleString(),
}: Props) {
    const labels = series[0]?.data.map((item) => item.label) ?? [];
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 44;

    const allValues = series.flatMap((item) => item.data.map((point) => Number(point.value || 0)));
    const maxValue = max ?? Math.max(...allValues, 1);

    if (!series.length || !labels.length) {
        return (
            <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                No radar data available.
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {[0.25, 0.5, 0.75, 1].map((level) => {
                    const points = labels
                        .map((_, index) => {
                            const p = point(cx, cy, radius * level, index, labels.length);
                            return `${p.x},${p.y}`;
                        })
                        .join(' ');

                    return (
                        <polygon
                            key={level}
                            points={points}
                            fill="none"
                            stroke="rgba(148,163,184,.35)"
                        />
                    );
                })}

                {labels.map((label, index) => {
                    const end = point(cx, cy, radius, index, labels.length);
                    const labelPoint = point(cx, cy, radius + 24, index, labels.length);

                    return (
                        <g key={label}>
                            <line x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="rgba(148,163,184,.25)" />
                            <text
                                x={labelPoint.x}
                                y={labelPoint.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-muted-foreground text-[10px] font-medium"
                            >
                                {label}
                            </text>
                        </g>
                    );
                })}

                {series.map((item, seriesIndex) => {
                    const color = item.color ?? defaultColors[seriesIndex % defaultColors.length];

                    const points = item.data
                        .map((metric, index) => {
                            const valueRadius = (Number(metric.value || 0) / maxValue) * radius;
                            const p = point(cx, cy, valueRadius, index, item.data.length);
                            return `${p.x},${p.y}`;
                        })
                        .join(' ');

                    return (
                        <g key={item.label}>
                            <polygon points={points} fill={color} opacity="0.14" stroke={color} strokeWidth="2" />

                            {item.data.map((metric, index) => {
                                const valueRadius = (Number(metric.value || 0) / maxValue) * radius;
                                const p = point(cx, cy, valueRadius, index, item.data.length);

                                return (
                                    <circle key={`${item.label}-${metric.label}`} cx={p.x} cy={p.y} r="4" fill="white" stroke={color} strokeWidth="2">
                                        <title>
                                            {item.label} • {metric.label}: {formatter(metric.value)}
                                        </title>
                                    </circle>
                                );
                            })}
                        </g>
                    );
                })}
            </svg>

            <div className="flex flex-wrap justify-center gap-3 text-xs">
                {series.map((item, index) => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: item.color ?? defaultColors[index % defaultColors.length] }}
                        />
                        <span className="text-muted-foreground">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}