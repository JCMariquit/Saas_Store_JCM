type StackedSegment = {
    label: string;
    value: number;
    color?: string;
};

type StackedBarItem = {
    label: string;
    segments: StackedSegment[];
};

type Props = {
    data: StackedBarItem[];
    orientation?: 'vertical' | 'horizontal';
    formatter?: (value: number) => string;
    height?: number;
};

const defaultColors = [
    '#2563eb',
    '#16a34a',
    '#f59e0b',
    '#dc2626',
    '#7c3aed',
    '#0891b2',
    '#db2777',
];

export default function StackedBarChart({
    data,
    orientation = 'vertical',
    formatter = (value) => value.toLocaleString(),
    height = 280,
}: Props) {
    const maxTotal = Math.max(
        ...data.map((item) => item.segments.reduce((sum, segment) => sum + Number(segment.value || 0), 0)),
        1,
    );

    if (!data.length) {
        return (
            <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                No chart data available.
            </div>
        );
    }

    if (orientation === 'horizontal') {
        return (
            <div className="space-y-4" style={{ minHeight: height }}>
                {data.map((item) => {
                    const total = item.segments.reduce((sum, segment) => sum + Number(segment.value || 0), 0);

                    return (
                        <div key={item.label} className="space-y-2">
                            <div className="flex justify-between gap-3 text-xs">
                                <span className="font-medium">{item.label}</span>
                                <span className="text-muted-foreground">{formatter(total)}</span>
                            </div>

                            <div className="flex h-7 overflow-hidden rounded-lg bg-muted">
                                {item.segments.map((segment, index) => {
                                    const width = total > 0 ? (Number(segment.value || 0) / total) * 100 : 0;

                                    return (
                                        <div
                                            key={`${item.label}-${segment.label}`}
                                            style={{
                                                width: `${width}%`,
                                                backgroundColor: segment.color ?? defaultColors[index % defaultColors.length],
                                            }}
                                            title={`${item.label} • ${segment.label}: ${formatter(segment.value)}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex items-end gap-4 overflow-x-auto border-b pb-2" style={{ height }}>
            {data.map((item) => {
                const total = item.segments.reduce((sum, segment) => sum + Number(segment.value || 0), 0);
                const barHeight = Math.max((total / maxTotal) * (height - 80), 8);

                return (
                    <div key={item.label} className="flex min-w-20 flex-1 flex-col items-center gap-2">
                        <div className="text-xs font-medium">{formatter(total)}</div>

                        <div className="flex w-full flex-col-reverse overflow-hidden rounded-t-lg bg-muted" style={{ height: barHeight }}>
                            {item.segments.map((segment, index) => {
                                const segmentHeight = total > 0 ? (Number(segment.value || 0) / total) * 100 : 0;

                                return (
                                    <div
                                        key={`${item.label}-${segment.label}`}
                                        style={{
                                            height: `${segmentHeight}%`,
                                            backgroundColor: segment.color ?? defaultColors[index % defaultColors.length],
                                        }}
                                        title={`${item.label} • ${segment.label}: ${formatter(segment.value)}`}
                                    />
                                );
                            })}
                        </div>

                        <div className="text-xs text-muted-foreground">{item.label}</div>
                    </div>
                );
            })}
        </div>
    );
}