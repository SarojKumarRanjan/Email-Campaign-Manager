

"use client";

import {
  DataTable,
  DataTableColumnDef,
  DataTableFilterField,
} from "../common/data-table";
import { Button } from "../ui/button";
import { useFilters } from "@/hooks/usefilters";
import { Badge } from "../ui/badge";
import { SquarePen, Trash2 } from "lucide-react";
import { useConfigurableMutation, useFetch } from "@/hooks/useApiCalls";
import API_PATH from "@/lib/apiPath";
import { deleteAxiosForUseFetch, getAxiosForUseFetch } from "@/lib/axios";
import { ListResponse } from "@/types";
import { formatReadableDateSafe } from "@/lib/utils";
import { Small, MutedText } from "../common/typography";
import { List } from "@/types/list";
import PopupConfirm from "../common/popup-confirm";
import { useState } from "react";
import { TruncatedTooltip } from "../common/truncated-tooltip";
import CreateList from "./create-list";
import { FullscreenModal } from "../common/fullscreen-modal";
import { TagDetailView } from "./tag-detail-view";

export default function ListView() {
  const [selectforDelete, setSelectforDelete] = useState<number | undefined>(undefined);
  const [openDelete, setOpenDelete] = useState(false);

  // Edit state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editListId, setEditListId] = useState<string | undefined>(undefined);

  // Detail Modal state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailType, setDetailType] = useState<"contacts" | "campaigns">("contacts");
  const [selectedTagId, setSelectedTagId] = useState<string | number | undefined>(undefined);


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
  } = useFilters<List>({
    defaultSortBy: "name",
    defaultSortOrder: "asc",
    defaultPageSize:6
  });

  const { data: tagsList, isLoading } = useFetch<ListResponse<List>>(
    getAxiosForUseFetch,
    ["tagslist"],
    {
      url: { template: API_PATH.TAGS.LIST_TAGS },
      params: {
        page,
        limit: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
        filters: JSON.stringify(filters),
        join_operator: joinOperator,
      },
    },
  );

  const { mutate: deleteTag } = useConfigurableMutation(
    deleteAxiosForUseFetch,
    ["tagslist"],
  );

  const columns: DataTableColumnDef<List>[] = [
    {
      accessorKey: "name",
      header: "Name",
      sortable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Small className={`font-medium hover:underline `}>{<TruncatedTooltip value={row.name} limit={20} />}</Small>
          <div style={{ backgroundColor: row.color || "#3B82F6" }} className={`size-4 rounded-md`}>

          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <MutedText className="max-w-[300px] truncate">
          {row.description || "-"}
        </MutedText>
      ),
    },
    {
      accessorKey: "contact_count",
      header: "Contacts",
      cell: ({ row }) => (
        <Badge 
          variant="outline" 
          className="cursor-pointer hover:bg-primary/80 active:scale-95 transition-all"
          onClick={() => {
            setSelectedTagId(row.id);
            setDetailType("contacts");
            setDetailOpen(true);
          }}
        >
          {` View  ${row.contact_count || 0}`}
        </Badge>
      ),
    },
    {
      accessorKey: "campaign_count",
      header: "Campaigns",
      cell: ({ row }) => (
        <Badge 
          variant="outline" 
          className="cursor-pointer hover:bg-primary/80 active:scale-95 transition-all"
          onClick={() => {
            setSelectedTagId(row.id);
            setDetailType("campaigns");
            setDetailOpen(true);
          }}
        >
          {` View  ${row.campaign_count || 0}`}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      sortable: true,
      cell: ({ row }) => (
        <MutedText>
          {formatReadableDateSafe(row.created_at)}
        </MutedText>
      ),
    },
    {
      accessorKey: "id", 
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => {
                setEditListId(row.id.toString());
                setIsEditOpen(true);
              }}
            >
              <SquarePen className="h-4 w-4" />
            </Button>
            
            <PopupConfirm
              open={openDelete && selectforDelete === row.id}
              onOpenChange={(open) => {
                setOpenDelete(open);
                if (open) setSelectforDelete(row.id);
              }}
              title="Delete Tag"
              description={`Are you sure you want to delete the tag "${row.name}"? This action cannot be undone.`}
              proceedText="Delete"
              variant="error"
              onProceed={() => {
                deleteTag({
                    url: { template: API_PATH.TAGS.DELETE_TAG, variables: [row.id.toString()] }
                });
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => {
                  setSelectforDelete(row.id);
                  setOpenDelete(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </PopupConfirm>
          </div>
        );
      },
    },
  ];

  const filterFields: DataTableFilterField<List>[] = [
    {
      id: "name",
      label: "Name",
      placeholder: "Filter by name...",
    },
  ];

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={tagsList?.data || []}
        loading={isLoading}
        pagination={{
          page: page,
          pageSize: pageSize,
          total: tagsList?.total || 0,
          onPageChange: (newPage) => setPage(newPage),
          onPageSizeChange: (newSize) => setPageSize(newSize),
        }}
        sorting={{
          sortBy: sortBy,
          sortOrder: sortOrder,
          onSortChange: (newSortBy, newOrder) => {
            setSortBy(newSortBy);
            setSortOrder(newOrder);
          },
        }}
        filtering={{
          filters: filters,
          onFilterChange: (newFilters) => setFilters(newFilters),
          joinOperator: joinOperator,
          onJoinOperatorChange: (op) => setJoinOperator(op),
        }}
        filterFields={filterFields}
      />

      {editListId && (
        <CreateList
          open={isEditOpen}
          onClose={() => {
            setEditListId(undefined);
            setIsEditOpen(false);
          }}
          listId={editListId}
        />
      )}

      <FullscreenModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        side="bottom"
        height={100}
        title={detailType === "contacts" ? "Tag Contacts" : "Tag Campaigns"}
      >
        <TagDetailView type={detailType} tagId={selectedTagId} />
      </FullscreenModal>
    </div>
  );
}