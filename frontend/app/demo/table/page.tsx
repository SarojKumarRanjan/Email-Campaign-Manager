"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { DataTable, type DataTableColumnDef, type DataTableFilterField } from "@/components/common/data-table";
import { Badge } from "@/components/ui/badge";

import type { ExtendedColumnFilter } from "@/types/data-table";
import {
    useQueryState,
    parseAsBoolean
} from "nuqs";
import { useFilters } from "@/hooks/usefilters";


interface Contact {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    company?: string;
    is_subscribed?: boolean;
    custom_fields?: any;
    tag_ids?: number[];
}
const data: Contact[] = [
    {
        id: 1,
        email: "alice@example.com",
        first_name: "Alice",
        last_name: "Johnson",
        phone: "+1234567890",
        company: "Tech Corp",
        is_subscribed: true,
    },
    {
        id: 2,
        email: "bob@example.com",
        first_name: "Bob",
        last_name: "Smith",
        phone: "+0987654321",
        company: "Design Co",
        is_subscribed: false,
        tag_ids: [1],
    },
    {
        id: 3,
        email: "charlie@example.com",
        first_name: "Charlie",
        last_name: "Brown",
        is_subscribed: true,
        company: "Tech Corp",
    },
    {
        id: 4,
        email: "david@example.com",
        first_name: "David",
        last_name: "Wilson",
        is_subscribed: false,
    },
    {
        id: 5,
        email: "eve@example.com",
        first_name: "Eve",
        last_name: "Davis",
        is_subscribed: true,
        company: "Startup Inc",
    },
];

export default function DemoTablePage() {

    const [serverMode, setServerMode] = useQueryState("serverMode", parseAsBoolean.withDefault(false));

    const {
        page,
        setPage,
        pageSize,
        setPageSize,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        filters,
        setFilters,
        joinOperator,
        setJoinOperator
    } = useFilters<Contact>({
        defaultSortBy: "email",
        defaultSortOrder: "asc"
    });

    const [selectedRows, setSelectedRows] = React.useState<string[]>([]);

    const [loading, setLoading] = React.useState(false);

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        if (serverMode) {
            setLoading(true);
            setTimeout(() => setLoading(false), 5000);
        }
    };

    const handleSortChange = (newSortBy: string, newOrder: "asc" | "desc") => {
        setSortBy(newSortBy);
        setSortOrder(newOrder);
        if (serverMode) {
            setLoading(true);
            setTimeout(() => setLoading(false), 5000);
        }
    };

    const handleFilterChange = (newFilters: ExtendedColumnFilter<Contact>[]) => {
        setFilters(newFilters);
        if (serverMode) {
            setLoading(true);
            setTimeout(() => setLoading(false), 300);
        }
    };

    // --- Configuration ---

    const filterFields: DataTableFilterField<Contact>[] = [
        {
            id: "company",
            label: "Company",
            options: [
                { label: "Tech Corp", value: "Tech Corp" },
                { label: "Design Co", value: "Design Co" },
                { label: "Startup Inc", value: "Startup Inc" },
            ]
        },
        {
            id: "is_subscribed",
            label: "Status",
            options: [
                { label: "Subscribed", value: "true" },
                { label: "Unsubscribed", value: "false" },
            ]
        }
    ];

    const columns: DataTableColumnDef<Contact>[] = [
        {
            accessorKey: "email",
            header: "Email",
            sortable: true,
            filterable: true,
            filterVariant: "text",
            cell: ({ row }) => <span className="font-medium text-foreground">{row.email}</span>,
        },
        {
            accessorKey: "first_name",
            header: "First Name",
            sortable: true,
            filterable: true,
            filterVariant: "text",
            cell: ({ row }) => row.first_name || "-",
        },
        {
            accessorKey: "last_name",
            header: "Last Name",
            sortable: true,
            filterable: true,
            filterVariant: "text",
            cell: ({ row }) => row.last_name || "-",
        },
        {
            accessorKey: "company",
            header: "Company",
            filterable: true,
            filterVariant: "multiSelect",
            cell: ({ value }) => value || <span className="text-muted-foreground">-</span>,
        },
        {
            accessorKey: "is_subscribed",
            header: "Status",
            filterable: true,
            filterVariant: "select",
            cell: ({ value }) => (
                <Badge variant={value ? "default" : "secondary"}>
                    {value ? "Subscribed" : "Unsubscribed"}
                </Badge>
            ),
        },
    ];

    return (
        <div className="flex h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="font-bold text-2xl tracking-tight">DataTable Demo</h2>
                    <p className="text-muted-foreground">
                        Testing the abstracted table component with various features.
                    </p>
                </div>
                {/* Server Mode Toggle for Demo */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Server Mode: {serverMode ? "ON" : "OFF"}</span>
                    <Badge
                        variant={serverMode ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setServerMode(!serverMode)}
                    >
                        Toggle
                    </Badge>
                </div>
            </div>

            <DataTable
                data={data}
                columns={columns}
                filterFields={filterFields}
                loading={loading}
                serverMode={serverMode} // Passes the mode
                toolbar="advanced"

                // Pagination
                pagination={{
                    page: page,
                    pageSize: pageSize,
                    total: 100, // In serverMode, this comes from API. In client mode, table calculates it.
                    onPageChange: handlePageChange,
                    onPageSizeChange: setPageSize,
                }}

                // Sorting
                sorting={{
                    sortBy: sortBy,
                    sortOrder: sortOrder as "asc" | "desc",
                    onSortChange: handleSortChange,
                }}

                // Filtering
                filtering={{
                    enabled: true,
                    filters: filters,
                    onFilterChange: handleFilterChange,
                    joinOperator: joinOperator as "and" | "or",
                    onJoinOperatorChange: (op) => setJoinOperator(op)
                }}

                // Selection
                selection={{
                    enabled: true,
                    selectedRows: selectedRows,
                    onSelectionChange: setSelectedRows,
                }}

                // Bulk Actions
                bulkActions={[
                    {
                        label: "Delete",
                        icon: Trash2,
                        variant: "destructive",
                        onClick: (rows) => {
                            alert(`Deleting ${rows.length} rows`);
                            setSelectedRows([]);
                        }
                    }
                ]}
            />
        </div>
    );
}
