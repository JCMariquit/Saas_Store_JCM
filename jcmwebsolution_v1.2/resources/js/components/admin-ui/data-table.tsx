import { type ReactNode } from 'react';

type DataTableColumn = {
    key: string;
    label: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
    headerClassName?: string;
};

type DataTableProps = {
    columns: DataTableColumn[];
    children: ReactNode;
    empty?: boolean;
    emptyMessage?: string;
    colSpan?: number;
    compact?: boolean;
    striped?: boolean;
    hoverable?: boolean;
};

const alignClasses = { left: 'text-left', center: 'text-center', right: 'text-right' };

export function DataTable({
    columns,
    children,
    empty = false,
    emptyMessage = 'No records found.',
    colSpan,
    compact = false,
}: DataTableProps) {
    const totalCols = colSpan ?? columns.length;
    const padding = compact ? 'px-4 py-3' : 'px-4 py-3.5';

    return (
        <div className="overflow-hidden rounded-xl border border-border/70 bg-card/60">
            <div className="app-scrollbar-thin overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead className="bg-gradient-to-r from-primary/[0.055] via-muted/35 to-muted/20">
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} className={`${padding} text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground ${alignClasses[column.align ?? 'left']} ${column.className ?? ''} ${column.headerClassName ?? ''}`}>
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-card/35">
                        {empty ? (
                            <tr>
                                <td colSpan={totalCols} className="px-6 py-14 text-center">
                                    <div className="mx-auto flex size-11 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.06] text-primary">—</div>
                                    <p className="mt-3 text-xs font-semibold text-foreground">Nothing to show</p>
                                    <p className="mt-1 text-[10px] text-muted-foreground">{emptyMessage}</p>
                                </td>
                            </tr>
                        ) : children}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
