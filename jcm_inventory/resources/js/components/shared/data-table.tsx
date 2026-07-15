import type { LucideIcon } from 'lucide-react';
import type {
    Key,
    ReactNode,
} from 'react';

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
    cell: (
        row: T,
        index: number,
    ) => ReactNode;
    className?: string;
    headerClassName?: string;
};

type DataTableProps<T> = {
    data: T[];
    columns: DataTableColumn<T>[];

    getRowKey: (
        row: T,
        index: number,
    ) => Key;

    emptyIcon: LucideIcon;
    emptyTitle: string;
    emptyDescription?: string;
    emptyAction?: ReactNode;

    minWidth?: string;
    className?: string;
    tableClassName?: string;

    rowClassName?:
        | string
        | ((
              row: T,
              index: number,
          ) => string);

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
                description={
                    emptyDescription
                }
                action={emptyAction}
                className={className}
            />
        );
    }

    return (
        <div
            className={cn(
                'block w-full min-w-0',
                'max-w-full overflow-hidden',
                className,
            )}
        >
            <Table
                style={{
                    minWidth,
                }}
                className={cn(
                    'border-collapse',
                    tableClassName,
                )}
            >
                <TableHeader className="bg-muted/15">
                    <TableRow className="border-border/60 hover:bg-muted/15">
                        {columns.map(
                            (column) => (
                                <TableHead
                                    key={
                                        column.key
                                    }
                                    className={cn(
                                        'h-10 px-4',
                                        'text-[10px]',
                                        'font-semibold uppercase',
                                        'tracking-[0.1em]',
                                        'text-muted-foreground/75',
                                        column.headerClassName,
                                    )}
                                >
                                    {
                                        column.header
                                    }
                                </TableHead>
                            ),
                        )}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {data.map(
                        (
                            row,
                            rowIndex,
                        ) => (
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
                                    'group border-border/50',
                                    'transition-all duration-150',
                                    'hover:bg-primary/[0.025]',
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
                                {columns.map(
                                    (
                                        column,
                                    ) => (
                                        <TableCell
                                            key={
                                                column.key
                                            }
                                            className={cn(
                                                'px-4 py-3',
                                                'text-[13px]',
                                                column.className,
                                            )}
                                        >
                                            {column.cell(
                                                row,
                                                rowIndex,
                                            )}
                                        </TableCell>
                                    ),
                                )}
                            </TableRow>
                        ),
                    )}
                </TableBody>
            </Table>
        </div>
    );
}