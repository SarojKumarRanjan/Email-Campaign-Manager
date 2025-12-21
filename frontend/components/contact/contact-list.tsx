"use client";
import { DataTable, DataTableColumnDef, DataTableFilterField } from "../common/data-table";
import { Button } from "../ui/button";
import { useDataTableFilters } from "@/hooks/use-datatable-filters";
import { ExtendedColumnFilter } from "@/types/data-table";
import { Badge } from "../ui/badge";
import { SquarePen, Trash2 } from "lucide-react";
import { Contact } from "@/types/contact";
import { useFetch } from "@/hooks/useApiCalls";
import API_PATH from "@/lib/apiPath";
import { getAxiosForUseFetch } from "@/lib/axios";
import { ListResponse } from "@/types";
import { formatReadableDateSafe } from "@/lib/utils";
import { Text } from "../common/typography";
import CreateContact from "./create-contact";
import PopupConfirm from "../common/popup-confirm";



export default function ContactList() {

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
    } = useDataTableFilters<Contact>({
        defaultSortBy: "email",
        defaultSortOrder: "desc"
    });



    const { data: contactsList, isLoading } = useFetch<ListResponse<Contact>>(
        getAxiosForUseFetch,
        ["contactslist"],

        {
            url: {
                template: API_PATH.CONTACTS.LIST_CONTACTS,
            },
            params: {
                page,
                limit: pageSize,
                sort_by: sortBy,
                sort_order: sortOrder,
                filters: JSON.stringify(filters.map((item) => {
                    if (!Array.isArray(item.value)) {
                        return {
                            ...item,
                            value: [item.value]
                        }
                    }
                    return ({
                        ...item,
                        value: item.value
                    })
                })),
                join_operator: joinOperator
            }
        }

    )



    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const handleSortChange = (newSortBy: string, newOrder: "asc" | "desc") => {
        setSortBy(newSortBy);
        setSortOrder(newOrder);
    };

    const handleFilterChange = (newFilters: ExtendedColumnFilter<Contact>[]) => {
        setFilters(newFilters);
    };

    const filterFileds: DataTableFilterField<Contact>[] = [
        {
            id: "email",
            label: "Email",
            placeholder: "Search..."
        },
        {
            id: "campaign",
            label: "Campaign",
            options: [
                { value: "Campaign 1", label: "Campaign 1" },
                { value: "Campaign 2", label: "Campaign 2" },
                { value: "Campaign 3", label: "Campaign 3" },
            ]
        },
        {
            id: "tags",
            label: "Tags",
            options: [
                { value: "Tag 1", label: "Tag 1" },
                { value: "Tag 2", label: "Tag 2" },
                { value: "Tag 3", label: "Tag 3" },
            ]
        },
        {
            id: "created_at",
            label: "Created At",
        }
    ]

    const columns: DataTableColumnDef<Contact>[] = [
        {
            header: "Email",
            accessorKey: "email",
            sortable: true,
            filterable: true,
            filterVariant: "text",
            cell: ({ value }) => <Text>{value}</Text>,
            width: 200,
        },
        {
            header: "Name",
            accessorKey: "name",
            sortable: true,
            cell: ({ value }) => value,
        },

        {
            header: "Campaign",
            accessorKey: "campaign",
            sortable: true,
            filterable: true,
            filterVariant: "select",
            cell: ({ value }) => {
                if (!value) return "-";
                return value
            },
        },
        {
            header: "Tags",
            accessorKey: "tags",
            filterable: true,
            filterVariant: "multiSelect",
            sortable: false,
            cell: ({ value }) => {
                if (!value) return "-";
                return (
                    <div className="grid grid-cols-3 gap-2">
                        {value.map((tag: string) => (

                            <Badge key={tag} variant={"secondary"} color="success">{tag}</Badge>

                        ))}
                    </div>
                );
            },
        },
        {
            header: "Created At",
            accessorKey: "created_at",
            filterable: true,
            filterVariant: "dateRange",
            sortable: true,
            cell: ({ value }) => formatReadableDateSafe(value),
        },
        {
            header: "Updated At",
            accessorKey: "updated_at",
            sortable: false,
            cell: ({ value }) => formatReadableDateSafe(value),
        },
        {
            header: "Actions",
            accessorKey: "id",
            resizable: true,
            sortable: false,
            cell: ({ value }) => (
                <div className="flex items-center gap-2">
                    <CreateContact contactId={value}>
                        <Button variant="ghost" size="icon">
                            <SquarePen className="size-4" />
                        </Button>
                    </CreateContact>
                    <PopupConfirm
                        variant="error"
                        title="Delete Contact?"
                        description="This will permanently delete this contact. This action cannot be undone."
                        proceedText="Delete"
                        onProceed={() => {
                            console.log("Deleting contact:", value);
                            // TODO: Implement delete API call
                        }}
                    >
                        <Button variant="ghost" size="icon">
                            <Trash2 className="size-4" />
                        </Button>
                    </PopupConfirm>
                </div>
            ),
        },

    ];

    return (
        <div>
            <DataTable
                filterFields={filterFileds}
                columns={columns}
                data={contactsList?.data || []}
                toolbar="simple"
                loading={isLoading}
                serverMode={true}
                // Pagination
                pagination={{
                    page: page,
                    pageSize: pageSize,
                    total: contactsList?.total || 0,
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
                    filters: filters,
                    onFilterChange: handleFilterChange,
                    joinOperator: joinOperator as "and" | "or",
                    onJoinOperatorChange: (op) => setJoinOperator(op)
                }}

            />
        </div>
    );
}