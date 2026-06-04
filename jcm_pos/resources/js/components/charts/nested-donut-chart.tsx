type DonutSegment = {
    label: string;
    value: number;
    color?: string;
};

type DonutRing = {
    label: string;
    segments: DonutSegment[];
};

type Props = {
    rings: DonutRing[];
    size?: number;
    centerTitle?: string;
    centerValue?: string;
    formatter?: (value: number) => string;
};

const defaultColors = [
    '#2563eb',
    '#16a34a',
    '#f59e0b',
    '#dc2626',
    '#7c3aed',
    '#0891b2',
    '#db2777',
    '#0f766e',
    '#ea580c',
    '#334155',
];

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
    const angleRad = ((angle - 90) * Math.PI) / 180;

    return {
        x: cx + radius * Math.cos(angleRad),
        y: cy + radius * Math.sin(angleRad),
    };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
        'M',
        start.x,
        start.y,
        'A',
        radius,
        radius,
        0,
        largeArcFlag,
        0,
        end.x,
        end.y,
    ].join(' ');
}

export default function NestedDonutChart({
    rings,
    size = 320,
    centerTitle = 'Total',
    centerValue,
    formatter = (value) => value.toLocaleString(),
}: Props) {
    const safeRings = rings.slice(0, 5);
    const cx = size / 2;
    const cy = size / 2;
    const ringWidth = 18;
    const ringGap = 8;
    const outerRadius = size / 2 - 16;

    const total = safeRings[0]?.segments.reduce((sum, item) => sum + Number(item.value || 0), 0) ?? 0;

    return (
        <div className="flex flex-col gap-4">
            <div className="relative flex justify-center">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {safeRings.map((ring, ringIndex) => {
                        const radius = outerRadius - ringIndex * (ringWidth + ringGap);
                        const ringTotal = ring.segments.reduce((sum, item) => sum + Number(item.value || 0), 0);
                        let currentAngle = 0;

                        return (
                            <g key={ring.label}>
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={radius}
                                    fill="none"
                                    stroke="rgba(148, 163, 184, 0.18)"
                                    strokeWidth={ringWidth}
                                />

                                {ring.segments.map((segment, segmentIndex) => {
                                    const value = Number(segment.value || 0);
                                    const percent = ringTotal > 0 ? value / ringTotal : 0;
                                    const startAngle = currentAngle;
                                    const endAngle = currentAngle + percent * 360;
                                    currentAngle = endAngle;

                                    if (value <= 0) return null;

                                    return (
                                        <path
                                            key={`${ring.label}-${segment.label}-${segmentIndex}`}
                                            d={describeArc(cx, cy, radius, startAngle, endAngle)}
                                            fill="none"
                                            stroke={segment.color ?? defaultColors[segmentIndex % defaultColors.length]}
                                            strokeWidth={ringWidth}
                                            strokeLinecap="round"
                                        >
                                            <title>
                                                {ring.label} • {segment.label}: {formatter(value)}
                                            </title>
                                        </path>
                                    );
                                })}
                            </g>
                        );
                    })}
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-xs font-medium text-muted-foreground">{centerTitle}</div>
                        <div className="mt-1 text-2xl font-bold">{centerValue ?? formatter(total)}</div>
                    </div>
                </div>
            </div>

            <div className="grid gap-2 text-xs sm:grid-cols-2">
                {safeRings.map((ring) => (
                    <div key={ring.label} className="rounded-lg border p-3">
                        <div className="mb-2 font-semibold">{ring.label}</div>

                        <div className="space-y-1">
                            {ring.segments.map((segment, index) => (
                                <div key={`${ring.label}-legend-${segment.label}`} className="flex items-center justify-between gap-2">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <span
                                            className="size-2.5 shrink-0 rounded-full"
                                            style={{ backgroundColor: segment.color ?? defaultColors[index % defaultColors.length] }}
                                        />
                                        <span className="truncate text-muted-foreground">{segment.label}</span>
                                    </div>
                                    <span className="font-medium">{formatter(segment.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}