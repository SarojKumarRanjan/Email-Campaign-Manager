"use client";

import React, { useState } from "react";
import {
  DataTable,
  DataTableColumnDef,
  DataTableFilterField,
} from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { useFilters } from "@/hooks/usefilters";
import { ExtendedColumnFilter } from "@/types/data-table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Copy, Trash2, Star, MoreVertical } from "lucide-react";
import { Template, TemplateListResponse } from "@/types/template";
import { useConfigurableMutation, useFetch } from "@/hooks/useApiCalls";
import API_PATH from "@/lib/apiPath";
import { deleteAxiosForUseFetch, getAxiosForUseFetch, postAxiosForUseFetch } from "@/lib/axios";
import { formatReadableDateSafe } from "@/lib/utils";
import { Small } from "@/components/common/typography";
import { TruncatedTooltip } from "@/components/common/truncated-tooltip";
import PopupConfirm from "@/components/common/popup-confirm";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TemplateListProps {
  onEditTemplate?: (id: number) => void;
}

export const TemplateList = ({ onEditTemplate }: TemplateListProps) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

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
    setJoinOperator,
  } = useFilters<Template>({
    defaultPageSize:6,
    defaultSortBy: "created_at",
    defaultSortOrder: "desc",
  });

  const { data: templatesData, isLoading, refetch } = useFetch<TemplateListResponse>(
    getAxiosForUseFetch,
    ["templates", page.toString(), pageSize.toString(), sortBy, sortOrder, JSON.stringify(filters), joinOperator],
    {
      url: {
        template: API_PATH.TEMPLATES.LIST_TEMPLATES,
      },
      params: {
        page,
        limit: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
        filters: JSON.stringify(
          filters.map((item) => {
             // Consistency with ContactList backend parsing if needed, 
             // but here our backend handler expects the same format as ContactHandler
            if (!Array.isArray(item.value)) {
              return { ...item, value: [item.value] };
            }
            return item;
          })
        ),
        join_operator: joinOperator,
      },
    }
  );

  const deleteMutation = useConfigurableMutation(
    deleteAxiosForUseFetch,
    ["templates"],
    {
      onSuccess: () => {
        setDeleteConfirmId(null);
        refetch();
      },
    }
  );

  const duplicateMutation = useConfigurableMutation(
    postAxiosForUseFetch,
    ["templates"],
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  const setDefaultMutation = useConfigurableMutation(
    postAxiosForUseFetch,
    ["templates"],
    {
      onSuccess: () => {
        refetch();
      },
    }
  );

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleSortChange = (newSortBy: string, newOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newOrder);
  };
  const handleFilterChange = (newFilters: ExtendedColumnFilter<Template>[]) => setFilters(newFilters);

  const filterFields: DataTableFilterField<Template>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Search names...",
    },
    {
      id: "subject",
      label: "Subject",
      placeholder: "Search subjects...",
    },
    {
      id: "created_at",
      label: "Created At",
    },
  ];

  const columns: DataTableColumnDef<Template>[] = [
    {
      header: "Name",
      accessorKey: "name",
      sortable: true,
      filterable: true,
      filterVariant: "text",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
            <Small className="font-medium">
                <TruncatedTooltip value={row.name} limit={30} />
            </Small>
            {row.is_default && (
                <Badge variant="secondary" className="bg-green-500 text-white text-[10px] h-4 px-1">
                    <Star className="size-2.5 fill-current mr-0.5" />
                    Default
                </Badge>
            )}
        </div>
      ),
      width: 250,
    },
    {
      header: "Subject",
      accessorKey: "subject",
      sortable: true,
      filterable: true,
      filterVariant: "text",
      cell: ({ value }) => <span className="text-muted-foreground"><TruncatedTooltip value={value || "No subject"} limit={40} /></span>,
      width: 300,
    },
    {
      header: "Created At",
      accessorKey: "created_at",
      sortable: true,
      filterable: true,
      filterVariant: "dateRange",
      cell: ({ value }) => formatReadableDateSafe(value),
    },
    {
      header: "Actions",
      accessorKey: "id",
      sortable: false,
      cell: ({ row }) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditTemplate?.(row.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => duplicateMutation.mutate({ 
                    url: { template: API_PATH.TEMPLATES.DUPLICATE_TEMPLATE, variables: [row.id.toString()] } 
                })}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                </DropdownMenuItem>
                {!row.is_default && (
                    <DropdownMenuItem onClick={() => setDefaultMutation.mutate({ 
                        url: { template: API_PATH.TEMPLATES.SET_DEFAULT_TEMPLATE, variables: [row.id.toString()] } 
                    })}>
                        <Star className="mr-2 h-4 w-4" />
                        Set as Default
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onClick={() => setDeleteConfirmId(row.id)}
                    className="text-destructive focus:text-destructive"
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="w-full">
      <DataTable
        filterFields={filterFields}
        columns={columns}
        data={templatesData?.data || []}
        toolbar="simple"
        loading={isLoading}
        serverMode={true}
        pagination={{
          page: page,
          pageSize: pageSize,
          total: templatesData?.total || 0,
          onPageChange: handlePageChange,
          onPageSizeChange: setPageSize,
        }}
        sorting={{
          sortBy: sortBy,
          sortOrder: sortOrder as "asc" | "desc",
          onSortChange: handleSortChange,
        }}
        filtering={{
          enabled: true,
          filters: filters,
          onFilterChange: handleFilterChange,
          joinOperator: joinOperator as "and" | "or",
          onJoinOperatorChange: (op) => setJoinOperator(op),
        }}
      />

      <PopupConfirm
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        title="Delete Template"
        description="Are you sure you want to delete this template? This action cannot be undone."
        proceedText="Delete"
        cancelText="Cancel"
        variant="error"
        loading={deleteMutation.isPending}
        onProceed={() => {
            if (deleteConfirmId) {
                deleteMutation.mutate({
                    url: { 
                        template: API_PATH.TEMPLATES.DELETE_TEMPLATE, 
                        variables: [deleteConfirmId.toString()] 
                    },
                });
            }
        }}
      />
    </div>
  );
};
