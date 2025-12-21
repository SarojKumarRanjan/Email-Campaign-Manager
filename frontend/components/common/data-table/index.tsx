"use client";

import * as React from "react";
import type {
    ColumnDef,
    ColumnFiltersState,
    PaginationState,
    SortingState,
    VisibilityState,
    Table as TanstackTable,
    Row,
} from "@tanstack/react-table";
import {
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Settings2 } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getCommonPinningStyles, getDefaultFilterOperator } from "@/lib/data-table";
import type { Option, FilterVariant, ExtendedColumnFilter } from "@/types/data-table";
import { generateId } from "@/lib/id";


import { DataTablePagination } from "./data-table-pagination";
import { DataTableAdvancedToolbar } from "./data-table-advanced-toolbar";
import { DataTableToolbar } from "./data-table-toolbar";
import { DataTableFilterList } from "./data-table-filter-list";
import { DataTableSortList } from "./data-table-sort-list";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableSkeleton } from "./data-table-skeleton";
import NoDataFound from "@/components/common/no-data-found";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Re-export specific helpers
export * from "./data-table-column-header";
export * from "./data-table-view-options";
export * from "./data-table-pagination";
export * from "./data-table-advanced-toolbar";
export * from "./data-table-toolbar";

// --- Types ---

export interface DataTableFilterField<TData> {
    id: Extract<keyof TData, string>;
    label: string;
    placeholder?: string;
    options?: Option[];
}

export interface DataTableColumnDef<TData> {
    accessorKey: Extract<keyof TData, string>;
    id?: string;
    header: string | ((props: { column: any }) => React.ReactNode);
    cell?: (props: { row: TData; value: any }) => React.ReactNode;

    filterable?: boolean;
    filterVariant?: FilterVariant;

    sortable?: boolean;
    resizable?: boolean;

    sticky?: "left" | "right";
    width?: number;
    minWidth?: number;
    maxWidth?: number;
}

export interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
    data: TData[];
    columns: DataTableColumnDef<TData>[];
    loading?: boolean;
    onRowClick?: (row: TData) => void;
    serverMode?: boolean;

    // Configurations
    pagination?: {
        page: number; // 1-indexed
        pageSize: number;
        total: number;
        onPageChange: (page: number) => void;
        onPageSizeChange: (size: number) => void;
    };

    selection?: {
        enabled: boolean;
        selectedRows: string[]; // ID based
        onSelectionChange: (selectedIds: string[]) => void;
    };

    sorting?: {
        sortBy: string;
        sortOrder: 'asc' | 'desc';
        onSortChange: (sortBy: string, order: 'asc' | 'desc') => void;
    };

    filtering?: {
        filters: ExtendedColumnFilter<TData>[];
        onFilterChange: (filters: ExtendedColumnFilter<TData>[]) => void;
        joinOperator?: "and" | "or";
        onJoinOperatorChange?: (op: "and" | "or") => void;
    };

    filterFields?: DataTableFilterField<TData>[];

    expansion?: {
        expandedRows: string[];
        onExpansionChange: (expandedIds: string[]) => void;
        renderExpandedRow: (row: TData) => React.ReactNode;
    };

    stickyColumns?: {
        left?: string[];
        right?: string[];
    };

    bulkActions?: Array<{
        label: string;
        icon?: React.ComponentType<{ className?: string }>;
        onClick: (selectedRows: TData[]) => void;
        variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    }>;

    toolbar?: "advanced" | "simple" | "none";
}

// --- Component ---

export function DataTable<TData>({
    data,
    columns: configColumns,
    loading = false,
    onRowClick,
    serverMode = true, // Default to server main control

    pagination,
    selection,
    sorting,
    filtering,
    filterFields,
    expansion,
    stickyColumns,
    bulkActions,

    toolbar: initialToolbar = "advanced",
    children,
    className,
    ...props
}: DataTableProps<TData>) {

    const [toolbarMode, setToolbarMode] = React.useState<"advanced" | "simple" | "none">(initialToolbar);

    // --- State Mapping ---

    // Pagination
    const paginationState: PaginationState = React.useMemo(() => ({
        pageIndex: serverMode ? (pagination?.page ?? 1) - 1 : (pagination?.page ? pagination.page - 1 : 0),
        pageSize: pagination?.pageSize ?? 10,
    }), [pagination?.page, pagination?.pageSize, serverMode]);

    // Sorting
    const sortingState: SortingState = React.useMemo(() => {
        if (!sorting?.sortBy) return [];
        return [{ id: sorting.sortBy, desc: sorting.sortOrder === 'desc' }];
    }, [sorting?.sortBy, sorting?.sortOrder]);

    // Filtering
    // Sync: Advanced -> Simple (Table State)
    const columnFiltersState: ColumnFiltersState = React.useMemo(() => {
        return filtering?.filters.map(f => ({ id: f.id, value: f.value })) ?? [];
    }, [filtering?.filters]);

    // Selection
    const rowSelectionState = React.useMemo(() => {
        if (!selection?.selectedRows) return {};
        return selection.selectedRows.reduce((acc, id) => {
            acc[id] = true;
            return acc;
        }, {} as Record<string, boolean>);
    }, [selection?.selectedRows]);

    // Expansion
    const expandedState = React.useMemo(() => {
        if (!expansion?.expandedRows) return {};
        return expansion.expandedRows.reduce((acc, id) => {
            acc[id] = true;
            return acc;
        }, {} as Record<string, boolean>);
    }, [expansion?.expandedRows]);

    // --- Column Definition Transformation ---

    const tableColumns = React.useMemo<ColumnDef<TData>[]>(() => {
        const transformed: ColumnDef<TData>[] = configColumns.map((col) => {
            const filterField = filterFields?.find(f => f.id === col.accessorKey);

            return {
                id: col.id ?? col.accessorKey,
                accessorKey: col.accessorKey,
                header: typeof col.header === 'string'
                    ? ({ column }) => <DataTableColumnHeader column={column} label={col.header as string} />
                    : col.header,
                cell: col.cell
                    ? ({ row, getValue }) => col.cell!({ row: row.original, value: getValue() })
                    : undefined,
                enableSorting: col.sortable,
                enableColumnFilter: col.filterable,
                enableHiding: true,
                enableResizing: col.resizable,
                size: col.width,
                minSize: col.minWidth,
                maxSize: col.maxWidth,
                meta: {
                    label: filterField?.label ?? (typeof col.header === 'string' ? col.header : col.accessorKey),
                    placeholder: filterField?.placeholder,
                    variant: col.filterVariant,
                    options: filterField?.options,
                }
            } as ColumnDef<TData>;
        });

        if (selection?.enabled) {
            transformed.unshift({
                id: "select",
                header: ({ table }) => (
                    <Checkbox
                        checked={
                            table.getIsAllPageRowsSelected() ||
                            (table.getIsSomePageRowsSelected() && "indeterminate")
                        }
                        onCheckedChange={(value) =>
                            table.toggleAllPageRowsSelected(!!value)
                        }
                        aria-label="Select all"
                        className="translate-y-[2px]"
                    />
                ),
                cell: ({ row }) => (
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                        className="translate-y-[2px]"
                    />
                ),
                enableSorting: false,
                enableHiding: false,
                size: 30,
            });
        }

        return transformed;
    }, [configColumns, selection?.enabled, filterFields]);


    // --- Table Instance ---

    const table = useReactTable({
        data,
        columns: tableColumns,

        state: {
            pagination: paginationState,
            sorting: sortingState,
            columnFilters: columnFiltersState,
            rowSelection: rowSelectionState,
            expanded: expandedState,
            columnPinning: {
                left: stickyColumns?.left,
                right: stickyColumns?.right,
            }
        },

        pageCount: serverMode ? (pagination ? Math.ceil(pagination.total / pagination.pageSize) : -1) : undefined,

        enableRowSelection: selection?.enabled,
        enableMultiSort: false,

        // Manual Flags controlled by serverMode
        manualPagination: serverMode,
        manualSorting: serverMode,
        manualFiltering: serverMode,
        manualExpanding: serverMode,

        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const nextState = updater(paginationState);
                pagination?.onPageChange(nextState.pageIndex + 1);
                pagination?.onPageSizeChange(nextState.pageSize);
            } else {
                pagination?.onPageChange(updater.pageIndex + 1);
                pagination?.onPageSizeChange(updater.pageSize);
            }
        },
        onSortingChange: (updater) => {
            if (typeof updater === 'function') {
                const nextState = updater(sortingState);
                const first = nextState[0];
                if (first) {
                    sorting?.onSortChange(first.id, first.desc ? 'desc' : 'asc');
                } else {
                    sorting?.onSortChange('', 'asc');
                }
            } else {
                const first = updater[0];
                if (first) {
                    sorting?.onSortChange(first.id, first.desc ? 'desc' : 'asc');
                }
            }
        },

        // --- SYNC Logic: Simple -> Advanced ---
        onColumnFiltersChange: (updater) => {
            if (!filtering) return;

            const nextSimpleFilters = typeof updater === 'function'
                ? updater(columnFiltersState)
                : updater;

            // Merge logic: 
            // 1. If a filter exists in `nextSimpleFilters`, update or create it in `filtering.filters`.
            // 2. If a filter is missing in `nextSimpleFilters` but was present in `columnFiltersState`, remove it from `filtering.filters`.

            // We need to map `nextSimpleFilters` back to `ExtendedColumnFilter` objects.
            // Since Simple Toolbar only gives us ID and Value, we infer the rest from the column definition.

            const newComplexFilters: ExtendedColumnFilter<TData>[] = [];

            for (const simpleFilter of nextSimpleFilters) {
                const existingComplex = filtering.filters.find(f => f.id === simpleFilter.id);
                if (existingComplex) {
                    // Update existing
                    newComplexFilters.push({
                        ...existingComplex,
                        value: simpleFilter.value as string | string[],
                    });
                } else {
                    // Create new
                    const column = tableColumns.find(c => (c as any).accessorKey === simpleFilter.id || c.id === simpleFilter.id);
                    // We need to find the correct variant
                    // Note: accessing nested prop like this is a bit unsafe without types, but we know our structure.
                    const variant = (column as any)?.meta?.variant ?? 'text';

                    newComplexFilters.push({
                        id: simpleFilter.id as Extract<keyof TData, string>,
                        value: simpleFilter.value as string | string[],
                        variant: variant,
                        operator: getDefaultFilterOperator(variant),
                        filterId: generateId({ length: 8 }),
                    });
                }
            }

            // Note: This logic REPLACES the complex filters list with the simple one. 
            // This is acceptable because when using the Simple Toolbar, you are essentially resetting the "Advanced" view to a flat list.
            // If we wanted to merge (keep complex filters that aren't touched), it would be much harder because Simple Toolbar "controls" the whole state of that column.

            filtering.onFilterChange(newComplexFilters);
        },
        onRowSelectionChange: (updater) => {
            if (typeof updater === 'function') {
                const nextState = updater(rowSelectionState);
                selection?.onSelectionChange(Object.keys(nextState));
            } else {
                selection?.onSelectionChange(Object.keys(updater));
            }
        },
        onExpandedChange: (updater) => {
            if (typeof updater === 'function') {
                const nextState = updater(expandedState);
                expansion?.onExpansionChange(Object.keys(nextState));
            } else {
                expansion?.onExpansionChange(Object.keys(updater));
            }
        },

        // Modules
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getRowId: (row) => (row as any).id?.toString() ?? (row as any).uid?.toString() ?? JSON.stringify(row), // Fallback ID
    });

    return (
        <div className={cn("w-full space-y-4", className)} {...props}>
            {/* Toolbar Wrapper with Switcher */}
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    {toolbarMode === "advanced" ? (
                        <DataTableAdvancedToolbar table={table}>
                            {filtering && (
                                <DataTableFilterList
                                    table={table}
                                    filters={filtering.filters}
                                    onFiltersChange={filtering.onFilterChange}
                                    joinOperator={filtering.joinOperator ?? "and"}
                                    onJoinOperatorChange={filtering.onJoinOperatorChange}
                                />
                            )}
                            <DataTableSortList table={table} />
                            {children}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="ml-auto hidden h-8 font-normal lg:flex">
                                        <Settings2 className="mr-2 h-4 w-4" />
                                        Filter Mode
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Toolbar View</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setToolbarMode("simple")}>
                                        Simple
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setToolbarMode("advanced")}>
                                        Advanced
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </DataTableAdvancedToolbar>
                    ) : toolbarMode === "simple" ? (
                        <DataTableToolbar table={table}>
                            {children}
                            <DataTableSortList table={table} />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="ml-auto hidden h-8 font-normal lg:flex">
                                        <Settings2 className="mr-2 h-4 w-4" />
                                        Filter Mode
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Toolbar View</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setToolbarMode("simple")}>
                                        Simple
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setToolbarMode("advanced")}>
                                        Advanced
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </DataTableToolbar>
                    ) : null}
                </div>

                {/* Mode Switcher */}

            </div>

            <div className="rounded-md border overflow-hidden">
                {loading ? (
                    <DataTableSkeleton
                        columnCount={table.getAllColumns().length}
                        rowCount={6}
                        className="p-4"
                    />
                ) : (
                    <Table>
                        <TableHeader className="bg-muted ml-4 h-12 sticky top-0">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead
                                                key={header.id}
                                                colSpan={header.colSpan}
                                                style={{
                                                    ...getCommonPinningStyles({ column: header.column }),
                                                    width: header.getSize(),
                                                }}
                                            >
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <React.Fragment key={row.id}>
                                        <TableRow
                                            data-state={row.getIsSelected() && "selected"}
                                            onClick={() => onRowClick?.(row.original)}
                                            className={cn(onRowClick && "cursor-pointer")}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell
                                                    className="py-4"
                                                    key={cell.id}
                                                    style={{
                                                        ...getCommonPinningStyles({ column: cell.column }),
                                                    }}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                        {row.getIsExpanded() && expansion?.renderExpandedRow && (
                                            <TableRow>
                                                <TableCell colSpan={row.getVisibleCells().length}>
                                                    {expansion.renderExpandedRow(row.original)}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={table.getAllColumns().length}
                                        className="h-24 text-center"
                                    >
                                        <NoDataFound />
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {!loading && <DataTablePagination table={table} />}

            {/* Floating Bar for Bulk Actions */}
            {(selection?.enabled && selection.selectedRows.length > 0 && bulkActions) ? (
                <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
                    <div className="flex items-center gap-2 rounded-md border bg-background p-2 shadow-sm">
                        <span className="text-sm font-medium mr-2">
                            {selection.selectedRows.length} selected
                        </span>
                        {bulkActions.map((action, i) => (
                            <Button
                                key={i}
                                variant={action.variant ?? "default"}
                                size="sm"
                                onClick={() => {
                                    const selectedData = table.getSelectedRowModel().rows.map(r => r.original);
                                    action.onClick(selectedData);
                                }}
                            >
                                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                                {action.label}
                            </Button>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
