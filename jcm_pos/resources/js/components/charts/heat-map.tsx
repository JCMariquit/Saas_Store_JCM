type HeatMapCell = {
    label: string;
    value: number;
};

type Props = {
    data: HeatMapCell[];
    columns?: number;
    formatter?: (value: number) => string;
};

function getLevel(value: number, maxValue: number) {
    const percent = maxValue > 0 ? (value / maxValue) * 100 : 0;

    if (value <= 0) return 'bg-muted border-border text-muted-foreground';
    if (percent <= 25) return 'bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-900 dark:text-emerald-300';
    if (percent <= 50) return 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-900 dark:text-yellow-300';
    if (percent <= 75) return 'bg-orange-100 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-900 dark:text-orange-300';

    return 'bg-red-100 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-900 dark:text-red-300';
}

export default function HeatMap({
    data,
    columns = 7,
    formatter = (value) => value.toLocaleString(),
}: Props) {
    const maxValue = Math.max(...data.map((item) => Number(item.value || 0)), 1);

    if (!data.length) {
        return (
            <div className="flex h-72 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
                No heat map data available.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div
                className="grid gap-2"
                style={{
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
            >
                {data.map((item) => (
                    <div
                        key={item.label}
                        className={`min-h-16 rounded-lg border p-2 transition hover:scale-[1.02] ${getLevel(item.value, maxValue)}`}
                        title={`${item.label}: ${formatter(item.value)}`}
                    >
                        <div className="text-xs font-medium">{item.label}</div>
                        <div className="mt-2 text-lg font-bold">{formatter(item.value)}</div>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Less</span>
                <span className="size-3 rounded border bg-muted" />
                <span className="size-3 rounded border bg-emerald-100" />
                <span className="size-3 rounded border bg-yellow-100" />
                <span className="size-3 rounded border bg-orange-100" />
                <span className="size-3 rounded border bg-red-100" />
                <span>More</span>
            </div>
        </div>
    );
}