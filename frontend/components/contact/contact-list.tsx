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


const serverMode = false;

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
        defaultSortOrder: "asc"
    });


    const isLoading = false;
    /*     const { data: contactsList, isLoading } = useFetch<Contact[]>(
            getAxiosForUseFetch,
            ["contactslist"],
    
            {
                url: {
                    template: API_PATH.CONTACTS.LIST_CONTACTS,
                },
                params: {
                    page,
                    page_size: pageSize,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                    filters: JSON.stringify(filters),
                    join_operator: joinOperator
                }
            }
    
        )
    
        console.log({ contactsList }); */

    console.log({ filters });


    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        if (serverMode) {

        }
    };

    const handleSortChange = (newSortBy: string, newOrder: "asc" | "desc") => {
        setSortBy(newSortBy);
        setSortOrder(newOrder);
        if (serverMode) {

        }
    };

    const handleFilterChange = (newFilters: ExtendedColumnFilter<Contact>[]) => {
        setFilters(newFilters);
        if (serverMode) {

            setTimeout(() => setPage(1), 300);
        }
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
            cell: ({ value }) => value,
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
            cell: ({ value }) => value,
        },
        {
            header: "Tags",
            accessorKey: "tags",
            filterable: true,
            filterVariant: "multiSelect",
            sortable: false,
            cell: ({ value }) => {
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
            cell: ({ value }) => value,
        },
        {
            header: "Updated At",
            accessorKey: "updated_at",
            sortable: false,
            cell: ({ value }) => value,
        },
        {
            header: "Actions",
            accessorKey: "id",
            resizable: true,
            sortable: false,
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                        <SquarePen className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            ),
        },

    ];
    const data = [
        {
            id: 1,
            email: "john.doe@example.com",
            name: "John Doe",
            campaign: "Campaign 1",
            tags: ["Tag 1", "Tag 2"],
            created_at: "2023-01-01",
            updated_at: "2023-01-01",
        },
        {
            id: 2,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 3,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 4,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 5,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 6,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 7,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 8,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 9,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 10,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 11,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 12,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 13,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 14,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 15,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 16,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 17,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 18,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 19,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
        {
            id: 20,
            email: "jane.doe@example.com",
            name: "Jane Doe",
            campaign: "Campaign 2",
            tags: ["Tag 3", "Tag 4"],
            created_at: "2023-01-02",
            updated_at: "2023-01-02",
        },
    ];
    return (
        <div>
            <DataTable
                filterFields={filterFileds}
                columns={columns}
                data={data}
                toolbar="simple"
                loading={isLoading}

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
                    filters: filters,
                    onFilterChange: handleFilterChange,
                    joinOperator: joinOperator as "and" | "or",
                    onJoinOperatorChange: (op) => setJoinOperator(op)
                }}

            />
        </div>
    );
}