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
    title?: string;
    description?: string;
    height?: number;
    formatter?: (value: number) => string;
    showTrendLine?: boolean;
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

function buildStraightPath(points: { x: number; y: number }[]) {
    if (!points.length) return '';

    return points.reduce((path, point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;
        return `${path} L ${point.x} ${point.y}`;
    }, '');
}

export default function MountainTrendChart({
    series,
    title = 'Trend Overview',
    description = 'Performance movement over time',
    height = 360,
    formatter = (value) => value.toLocaleString(),
    showTrendLine = true,
}: Props) {
    const labels = series[0]?.data.map((item) => item.label) ?? [];

    if (!series.length || !labels.length) {
        return (
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div>
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>

                <div className="mt-6 flex h-72 items-center justify-center rounded-xl border border-dashed bg-muted/20 text-sm text-muted-foreground">
                    No trend data available.
                </div>
            </div>
        );
    }

    const width = Math.max((labels.length || 1) * 96, 720);
    const padding = 58;
    const bottomPadding = 52;

    const allValues = series.flatMap((item) => item.data.map((point) => Number(point.value || 0)));
    const maxValue = Math.max(...allValues, 1);
    const minValue = Math.min(...allValues, 0);
    const valueRange = Math.max(maxValue - minValue, 1);

    const chartHeight = height - padding - bottomPadding;
    const chartWidth = width - padding * 2;

    return (
        <div className="rounded-2xl border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {series.map((item, index) => (
                        <div key={item.label} className="flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs">
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{
                                    backgroundColor: item.color ?? defaultColors[index % defaultColors.length],
                                }}
                            />
                            <span className="font-medium text-muted-foreground">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4">
                <div className="overflow-x-auto rounded-xl bg-muted/10">
                    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img">
                        <defs>
                            {series.map((item, index) => {
                                const color = item.color ?? defaultColors[index % defaultColors.length];

                                return (
                                    <linearGradient key={item.label} id={`mountain-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                                        <stop offset="55%" stopColor={color} stopOpacity="0.1" />
                                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                                    </linearGradient>
                                );
                            })}
                        </defs>

                        {[0, 25, 50, 75, 100].map((tick) => {
                            const y = padding + chartHeight - (tick / 100) * chartHeight;
                            const value = minValue + (valueRange * tick) / 100;

                            return (
                                <g key={tick}>
                                    <line
                                        x1={padding}
                                        x2={width - padding}
                                        y1={y}
                                        y2={y}
                                        stroke="currentColor"
                                        className="text-border"
                                        strokeDasharray="5 8"
                                    />
                                    <text x={16} y={y + 4} className="fill-muted-foreground text-[10px] font-medium">
                                        {formatter(value)}
                                    </text>
                                </g>
                            );
                        })}

                        {labels.map((label, index) => {
                            const x = padding + (index / Math.max(labels.length - 1, 1)) * chartWidth;

                            return (
                                <g key={label}>
                                    <line
                                        x1={x}
                                        x2={x}
                                        y1={padding}
                                        y2={padding + chartHeight}
                                        stroke="currentColor"
                                        className="text-border/50"
                                        strokeDasharray="4 12"
                                    />

                                    <text x={x} y={height - 20} textAnchor="middle" className="fill-muted-foreground text-[10px] font-medium">
                                        {label}
                                    </text>
                                </g>
                            );
                        })}

                        {series.map((item, seriesIndex) => {
                            const color = item.color ?? defaultColors[seriesIndex % defaultColors.length];

                            const points = item.data.map((point, index) => {
                                const x = padding + (index / Math.max(item.data.length - 1, 1)) * chartWidth;
                                const y = padding + chartHeight - ((Number(point.value || 0) - minValue) / valueRange) * chartHeight;

                                return {
                                    x,
                                    y,
                                    value: Number(point.value || 0),
                                    label: point.label,
                                };
                            });

                            const linePath = buildSmoothPath(points);
                            const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${
                                padding + chartHeight
                            } Z`;

                            const firstPoint = points[0];
                            const lastPoint = points[points.length - 1];
                            const trendPath = buildStraightPath([firstPoint, lastPoint]);

                            return (
                                <g key={item.label}>
                                    <path d={areaPath} fill={`url(#mountain-gradient-${seriesIndex})`} />

                                    {showTrendLine && points.length > 1 && (
                                        <path
                                            d={trendPath}
                                            fill="none"
                                            stroke={color}
                                            strokeWidth="2"
                                            strokeDasharray="7 7"
                                            opacity="0.45"
                                            strokeLinecap="round"
                                        />
                                    )}

                                    <path d={linePath} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                                    {points.map((point, index) => {
                                        const isLast = index === points.length - 1;
                                        const valueText = formatter(point.value);
                                        const badgeWidth = Math.max(valueText.length * 7.5 + 20, 66);
                                        const badgeX = Math.min(point.x + 12, width - padding - badgeWidth);
                                        const badgeY = Math.max(point.y - 17, 14);

                                        return (
                                            <g key={`${item.label}-${point.label}`}>
                                                <circle cx={point.x} cy={point.y} r={isLast ? 6.5 : 5} fill="hsl(var(--card))" stroke={color} strokeWidth="3">
                                                    <title>
                                                        {item.label} • {point.label}: {valueText}
                                                    </title>
                                                </circle>

                                                <circle cx={point.x} cy={point.y} r="2.2" fill={color} />

                                                {isLast && (
                                                    <g>
                                                        <rect x={badgeX} y={badgeY} width={badgeWidth} height="30" rx="10" fill={color} opacity="0.96" />

                                                        <text x={badgeX + 10} y={badgeY + 19} className="fill-white text-[11px] font-semibold">
                                                            {valueText}
                                                        </text>
                                                    </g>
                                                )}
                                            </g>
                                        );
                                    })}
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>
        </div>
    );
}