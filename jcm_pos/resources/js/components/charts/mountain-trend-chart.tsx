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
    height = 360,
    formatter = (value) => value.toLocaleString(),
    showTrendLine = true,
}: Props) {
    const labels = series[0]?.data.map((item) => item.label) ?? [];

    const width = Math.max((labels.length || 1) * 90, 680);
    const padding = 54;
    const bottomPadding = 48;

    const allValues = series.flatMap((item) => item.data.map((point) => Number(point.value || 0)));
    const maxValue = Math.max(...allValues, 1);
    const minValue = Math.min(...allValues, 0);
    const valueRange = Math.max(maxValue - minValue, 1);

    const chartHeight = height - padding - bottomPadding;
    const chartWidth = width - padding * 2;

    if (!series.length || !labels.length) {
        return (
            <div className="flex h-72 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
                No trend data available.
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
            <div className="overflow-x-auto">
                <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                    <defs>
                        {series.map((item, index) => {
                            const color = item.color ?? defaultColors[index % defaultColors.length];

                            return (
                                <linearGradient key={item.label} id={`mountain-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                                    <stop offset="55%" stopColor={color} stopOpacity="0.12" />
                                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                                </linearGradient>
                            );
                        })}

                        <filter id="mountain-glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {[0, 25, 50, 75, 100].map((tick) => {
                        const y = padding + chartHeight - (tick / 100) * chartHeight;
                        const value = minValue + (valueRange * tick) / 100;

                        return (
                            <g key={tick}>
                                <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="currentColor" className="text-border" strokeDasharray="6 8" />
                                <text x={14} y={y + 4} className="fill-muted-foreground text-[10px]">
                                    {formatter(value)}
                                </text>
                            </g>
                        );
                    })}

                    {labels.map((label, index) => {
                        const x = padding + (index / Math.max(labels.length - 1, 1)) * chartWidth;

                        return (
                            <g key={label}>
                                <line x1={x} x2={x} y1={padding} y2={padding + chartHeight} stroke="currentColor" className="text-border/40" strokeDasharray="4 10" />

                                <text x={x} y={height - 18} textAnchor="middle" className="fill-muted-foreground text-[10px]">
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
                                value: point.value,
                                label: point.label,
                            };
                        });

                        const linePath = buildSmoothPath(points);
                        const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;

                        const firstPoint = points[0];
                        const lastPoint = points[points.length - 1];
                        const trendPath = buildStraightPath([firstPoint, lastPoint]);

                        return (
                            <g key={item.label}>
                                <path d={areaPath} fill={`url(#mountain-gradient-${seriesIndex})`} />

                                {showTrendLine && points.length > 1 && (
                                    <path d={trendPath} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="8 8" opacity="0.55" strokeLinecap="round" />
                                )}

                                <path
                                    d={linePath}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter="url(#mountain-glow)"
                                />

                                <path
                                    d={linePath}
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    opacity="0.35"
                                />

                                {points.map((point, index) => {
                                    const isLast = index === points.length - 1;

                                    return (
                                        <g key={`${item.label}-${point.label}`}>
                                            <circle cx={point.x} cy={point.y} r={isLast ? 7 : 5} fill="white" stroke={color} strokeWidth="3">
                                                <title>
                                                    {item.label} • {point.label}: {formatter(point.value)}
                                                </title>
                                            </circle>

                                            <circle cx={point.x} cy={point.y} r={2.5} fill={color} />

                                            {isLast && (
                                                <g>
                                                    <rect
                                                        x={point.x + 10}
                                                        y={point.y - 15}
                                                        width={Math.max(formatter(point.value).length * 7.5 + 18, 64)}
                                                        height="30"
                                                        rx="10"
                                                        fill={color}
                                                        opacity="0.95"
                                                    />

                                                    <text x={point.x + 20} y={point.y + 4} className="fill-white text-[11px] font-semibold">
                                                        {formatter(point.value)}
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

            <div className="mt-3 flex flex-wrap gap-3 text-xs">
                {series.map((item, index) => (
                    <div key={item.label} className="flex items-center gap-2 rounded-full border bg-muted/30 px-3 py-1.5">
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