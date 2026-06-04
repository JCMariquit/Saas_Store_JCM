type MountainPoint = {
    label: string;
    value: number;
};

type MountainSeries = {
    label: string;
    color?: string;
    data: MountainPoint[];
};

type Props = {
    series: MountainSeries[];
    height?: number;
    formatter?: (value: number) => string;
};

const defaultColors = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed'];

function buildSmoothPath(points: { x: number; y: number }[]) {
    if (!points.length) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let index = 1; index < points.length; index++) {
        const prev = points[index - 1];
        const current = points[index];
        const midX = (prev.x + current.x) / 2;

        path += ` C ${midX} ${prev.y}, ${midX} ${current.y}, ${current.x} ${current.y}`;
    }

    return path;
}

export default function MountainTrendChart({
    series,
    height = 360,
    formatter = (value) => value.toLocaleString(),
}: Props) {
    const labels = series[0]?.data.map((item) => item.label) ?? [];

    const width = Math.max((labels.length || 1) * 90, 520);
    const padding = 44;

    const allValues = series.flatMap((item) => item.data.map((point) => Number(point.value || 0)));
    const maxValue = Math.max(...allValues, 1);

    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;

    if (!series.length || !labels.length) {
        return (
            <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                No trend data available.
            </div>
        );
    }

    return (
        <div className="w-full rounded-lg border bg-muted/20 p-3">
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                {[0, 25, 50, 75, 100].map((tick) => {
                    const y = padding + chartHeight - (tick / 100) * chartHeight;

                    return (
                        <g key={tick}>
                            <line
                                x1={padding}
                                x2={width - padding}
                                y1={y}
                                y2={y}
                                stroke="rgba(148,163,184,0.25)"
                            />
                            <text x={12} y={y + 4} className="fill-muted-foreground text-[10px]">
                                {formatter((maxValue * tick) / 100)}
                            </text>
                        </g>
                    );
                })}

                {series.map((item, seriesIndex) => {
                    const color = item.color ?? defaultColors[seriesIndex % defaultColors.length];

                    const points = item.data.map((point, index) => {
                        const x = padding + (index / Math.max(item.data.length - 1, 1)) * chartWidth;
                        const y = padding + chartHeight - (Number(point.value || 0) / maxValue) * chartHeight;

                        return {
                            x,
                            y,
                            value: point.value,
                            label: point.label,
                        };
                    });

                    const linePath = buildSmoothPath(points);
                    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

                    return (
                        <g key={item.label}>
                            <path d={areaPath} fill={color} opacity="0.12" />
                            <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />

                            {points.map((point) => (
                                <circle
                                    key={`${item.label}-${point.label}`}
                                    cx={point.x}
                                    cy={point.y}
                                    r="4"
                                    fill="white"
                                    stroke={color}
                                    strokeWidth="2"
                                >
                                    <title>
                                        {item.label} • {point.label}: {formatter(point.value)}
                                    </title>
                                </circle>
                            ))}
                        </g>
                    );
                })}

                {labels.map((label, index) => {
                    const x = padding + (index / Math.max(labels.length - 1, 1)) * chartWidth;

                    return (
                        <text
                            key={label}
                            x={x}
                            y={height - 14}
                            textAnchor="middle"
                            className="fill-muted-foreground text-[10px]"
                        >
                            {label}
                        </text>
                    );
                })}
            </svg>

            <div className="mt-2 flex flex-wrap gap-3 text-xs">
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