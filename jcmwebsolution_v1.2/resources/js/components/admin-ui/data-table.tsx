import { ReactNode } from 'react';

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

const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

export function DataTable({
    columns,
    children,
    empty = false,
    emptyMessage = 'No records found.',
    colSpan,
    compact = false,
    striped = false,
    hoverable = true,
}: DataTableProps) {
    const totalCols = colSpan ?? columns.length;

    const cellPadding = compact ? 'px-4 py-3' : 'px-4 py-4';
    const rowClasses = [
        'border-t border-slate-200/80 transition-all duration-200',
        hoverable ? 'hover:bg-blue-50/40' : '',
        striped ? 'even:bg-slate-50/40' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className="overflow-hidden rounded-[6px] border border-blue-200 bg-white shadow-sm ring-1 ring-blue-100/50 transition hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/10">
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                    <thead className="bg-gradient-to-r from-slate-100 via-slate-50 to-blue-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`${cellPadding} text-xs font-bold uppercase tracking-[0.16em] text-slate-600 ${
                                        alignClasses[column.align ?? 'left']
                                    } ${column.className ?? ''} ${column.headerClassName ?? ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{column.label}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className={`bg-white ${!empty ? `[&>tr]:${rowClasses}` : ''}`}>
                        {empty ? (
                            <tr>
                                <td colSpan={totalCols} className="px-6 py-14 text-center">
                                    <div className="mx-auto max-w-md">
                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-400 ring-1 ring-blue-100">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                className="h-5 w-5"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M3 7h18M6 11h12M10 15h4M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
                                                />
                                            </svg>
                                        </div>

                                        <p className="text-sm font-semibold text-slate-700">
                                            Nothing to show yet
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {emptyMessage}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            children
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}