"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { InfiniteScroll } from "@/components/common/infinite-scroll";
import { TagCard } from "./list-card";
import { useFilters } from "@/hooks/usefilters";
import { useConfigurableMutation, useFetch } from "@/hooks/useApiCalls";
import { deleteAxiosForUseFetch, getAxiosForUseFetch } from "@/lib/axios";
import API_PATH from "@/lib/apiPath";
import { List } from "@/types/list";
import { ListResponse } from "@/types";
import CreateList from "./create-list";
import PopupConfirm from "../common/popup-confirm";
import { FullscreenModal } from "../common/fullscreen-modal";
import { TagDetailView } from "./tag-detail-view";

export default function GridView() {
  const {
    page,
    setPage,
    pageSize,
    sortBy,
    sortOrder,
    filters,
    joinOperator,
  } = useFilters<List>({
    defaultSortBy: "name",
    defaultSortOrder: "asc",
    defaultPageSize: 12,
  });

  const [allData, setAllData] = useState<List[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Edit state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editListId, setEditListId] = useState<string | undefined>(undefined);

  // Delete state
  const [selectforDelete, setSelectforDelete] = useState<string | number | undefined>(undefined);
  const [openDelete, setOpenDelete] = useState(false);

  // Detail Modal state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailType, setDetailType] = useState<"contacts" | "campaigns">("contacts");
  const [selectedTagId, setSelectedTagId] = useState<string | number | undefined>(undefined);

  // Memoize filters JSON to prevent unnecessary rerenders
  const filtersJson = useMemo(() => JSON.stringify(filters), [filters]);

  // Fetch data with proper query key
  const { data, isLoading, isPlaceholderData, error } = useFetch<ListResponse<List>>(
    getAxiosForUseFetch,
    [
      "tagslist",
      page.toString(),
      pageSize.toString(),
      sortBy,
      sortOrder,
      filtersJson,
      joinOperator,
    ],
    {
      url: { template: API_PATH.TAGS.LIST_TAGS },
      params: {
        page,
        limit: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
        filters: filtersJson,
        join_operator: joinOperator,
      },
    }
  );

  // Reset data when filters or sorting change (NOT page change)
  useEffect(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
  }, [sortBy, sortOrder, filtersJson, joinOperator, pageSize, setPage]);

  const { mutate: deleteTag } = useConfigurableMutation(
    deleteAxiosForUseFetch,
    ["tagslist"],
    {
      onSuccess: () => {
        setAllData((prev) => prev.filter((item) => item.id !== selectforDelete));
        setSelectforDelete(undefined);
        setOpenDelete(false);
      },
    }
  );

  // Handle data appending
  useEffect(() => {
    if (!data?.data) return;

    if (page === 1) {
      // First page - replace all data
      setAllData(data.data);
      setHasMore(data.data.length === pageSize && data.data.length < data.total);
    } else {
      // Subsequent pages - append new data
      setAllData((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = data.data.filter((item) => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
      
      // Check if there are more pages
      const totalFetched = (page - 1) * pageSize + data.data.length;
      setHasMore(data.data.length === pageSize && totalFetched < data.total);
    }
  }, [data, page, pageSize]);

  // Memoized fetch more callback
  const fetchMore = useCallback(() => {
    if (!isLoading && hasMore && !isPlaceholderData) {
      setPage((prev) => prev + 1);
    }
  }, [isLoading, hasMore, isPlaceholderData, setPage]);

  // Action handlers
  const handleEdit = useCallback((id: string | number) => {
    setEditListId(id.toString());
    setIsEditOpen(true);
  }, []);

  const handleDelete = useCallback((id: string | number) => {
    setSelectforDelete(id);
    setOpenDelete(true);
  }, []);

  const handleOpenDetail = useCallback((id: string | number, type: "contacts" | "campaigns") => {
    setSelectedTagId(id);
    setDetailType(type);
    setDetailOpen(true);
  }, []);

  // Key extractor for better performance
  const keyExtractor = useCallback((item: List) => item.id.toString(), []);

  // Error state
  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load tags</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
          <button
            onClick={() => setPage(1)}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <InfiniteScroll<List>
        data={allData}
        renderItem={(tag) => (
          <TagCard
            id={tag.id}
            title={tag.name}
            description={tag.description}
            contactCount={tag.contact_count}
            campaignCount={tag.campaign_count}
            color={tag.color}
            onEdit={() => handleEdit(tag.id)}
            onDelete={() => handleDelete(tag.id)}
            onViewContacts={() => handleOpenDetail(tag.id, "contacts")}
            onViewCampaigns={() => handleOpenDetail(tag.id, "campaigns")}
          />
        )}
        fetchMore={fetchMore}
        hasMore={hasMore}
        isLoading={isLoading}

        className="pb-10"
        keyExtractor={keyExtractor}
        emptyStateMessage="No tags found. Create your first tag to get started."
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

      <PopupConfirm
        open={openDelete}
        onOpenChange={setOpenDelete}
        title="Delete Tag"
        description="Are you sure you want to delete this tag? This action cannot be undone."
        proceedText="Delete"
        variant="error"
        onProceed={() => {
          if (selectforDelete) {
            deleteTag({
              url: {
                template: API_PATH.TAGS.DELETE_TAG,
                variables: [selectforDelete.toString()],
              },
            });
          }
        }}
      />

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