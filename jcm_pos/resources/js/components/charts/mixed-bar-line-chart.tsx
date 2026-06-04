type MixedChartItem = {
    label: string;
    barValue: number;
    lineValue: number;
};

type Props = {
    data: MixedChartItem[];
    height?: number;
    barLabel?: string;
    lineLabel?: string;
    formatter?: (value: number) => string;
};

function buildPath(points: { x: number; y: number }[]) {
    if (!points.length) return '';

    return points.reduce((path, point, index) => {
        if (index === 0) return `M ${point.x} ${point.y}`;

        const prev = points[index - 1];
        const midX = (prev.x + point.x) / 2;

        return `${path} C ${midX} ${prev.y}, ${midX} ${point.y}, ${point.x} ${point.y}`;
    }, '');
}

export default function MixedBarLineChart({
    data,
    height = 300,
    barLabel = 'Bar',
    lineLabel = 'Line',
    formatter = (value) => value.toLocaleString(),
}: Props) {
    const width = 900;
    const padding = 44;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxValue = Math.max(
        ...data.flatMap((item) => [Number(item.barValue || 0), Number(item.lineValue || 0)]),
        1,
    );

    if (!data.length) {
        return (
            <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                No mixed chart data available.
            </div>
        );
    }

    const linePoints = data.map((item, index) => {
        const x = padding + (index / Math.max(data.length - 1, 1)) * chartWidth;
        const y = padding + chartHeight - (Number(item.lineValue || 0) / maxValue) * chartHeight;

        return { x, y, value: item.lineValue, label: item.label };
    });

    return (
        <div className="overflow-x-auto rounded-lg border bg-muted/20 p-3">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {[0, 25, 50, 75, 100].map((tick) => {
                    const y = padding + chartHeight - (tick / 100) * chartHeight;

                    return (
                        <g key={tick}>
                            <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="rgba(148,163,184,.25)" />
                            <text x="10" y={y + 4} className="fill-muted-foreground text-[10px]">
                                {formatter((maxValue * tick) / 100)}
                            </text>
                        </g>
                    );
                })}

                {data.map((item, index) => {
                    const x = padding + (index / Math.max(data.length - 1, 1)) * chartWidth;
                    const barHeight = (Number(item.barValue || 0) / maxValue) * chartHeight;
                    const barWidth = 34;

                    return (
                        <g key={item.label}>
                            <rect
                                x={x - barWidth / 2}
                                y={padding + chartHeight - barHeight}
                                width={barWidth}
                                height={Math.max(barHeight, 3)}
                                rx="6"
                                fill="#2563eb"
                                opacity="0.78"
                            >
                                <title>
                                    {barLabel} • {item.label}: {formatter(item.barValue)}
                                </title>
                            </rect>

                            <text x={x} y={height - 14} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                                {item.label}
                            </text>
                        </g>
                    );
                })}

                <path d={buildPath(linePoints)} fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" />

                {linePoints.map((point) => (
                    <circle key={point.label} cx={point.x} cy={point.y} r="4" fill="white" stroke="#16a34a" strokeWidth="2">
                        <title>
                            {lineLabel} • {point.label}: {formatter(point.value)}
                        </title>
                    </circle>
                ))}
            </svg>

            <div className="mt-2 flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-[#2563eb]" />
                    <span className="text-muted-foreground">{barLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-[#16a34a]" />
                    <span className="text-muted-foreground">{lineLabel}</span>
                </div>
            </div>
        </div>
    );
}