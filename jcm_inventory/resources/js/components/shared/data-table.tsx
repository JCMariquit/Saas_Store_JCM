import type {
    Key,
    ReactNode,
} from 'react';
import type { LucideIcon } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type DataTableColumn<T> = {
    key: string;
    header: ReactNode;
    cell: (row: T, index: number) => ReactNode;
    className?: string;
    headerClassName?: string;
};

type DataTableProps<T> = {
    data: T[];
    columns: DataTableColumn<T>[];
    getRowKey: (row: T, index: number) => Key;

    emptyIcon: LucideIcon;
    emptyTitle: string;
    emptyDescription?: string;
    emptyAction?: ReactNode;

    minWidth?: string;
    className?: string;
    tableClassName?: string;

    rowClassName?:
        | string
        | ((row: T, index: number) => string);

    onRowClick?: (
        row: T,
        index: number,
    ) => void;
};

export function DataTable<T>({
    data,
    columns,
    getRowKey,
    emptyIcon,
    emptyTitle,
    emptyDescription,
    emptyAction,
    minWidth = '900px',
    className,
    tableClassName,
    rowClassName,
    onRowClick,
}: DataTableProps<T>) {
    if (data.length === 0) {
        return (
            <EmptyState
                icon={emptyIcon}
                title={emptyTitle}
                description={emptyDescription}
                action={emptyAction}
                className={className}
            />
        );
    }

    return (
        <div className={cn('w-full', className)}>
            <Table
                style={{ minWidth }}
                className={tableClassName}
            >
                <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-muted/40">
                        {columns.map((column) => (
                            <TableHead
                                key={column.key}
                                className={
                                    column.headerClassName
                                }
                            >
                                {column.header}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.map((row, rowIndex) => (
                        <TableRow
                            key={getRowKey(
                                row,
                                rowIndex,
                            )}
                            onClick={() =>
                                onRowClick?.(
                                    row,
                                    rowIndex,
                                )
                            }
                            className={cn(
                                onRowClick &&
                                    'cursor-pointer',
                                typeof rowClassName ===
                                    'function'
                                    ? rowClassName(
                                          row,
                                          rowIndex,
                                      )
                                    : rowClassName,
                            )}
                        >
                            {columns.map((column) => (
                                <TableCell
                                    key={column.key}
                                    className={
                                        column.className
                                    }
                                >
                                    {column.cell(
                                        row,
                                        rowIndex,
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}