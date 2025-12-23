

"use client";

import React, { useState, useEffect } from "react";
import { InfiniteScroll } from "@/components/common/infinite-scroll";
import { TagCard } from "./list-card";
import { useFilters } from "@/hooks/usefilters";
import { useFetch } from "@/hooks/useApiCalls";
import { getAxiosForUseFetch } from "@/lib/axios";
import API_PATH from "@/lib/apiPath";
import { List } from "@/types/list";
import { ListResponse } from "@/types";

export default function GridView() {
  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    sortBy,
    sortOrder,
    filters,
    joinOperator,
  } = useFilters<List>({
    defaultSortBy: "name",
    defaultSortOrder: "asc",
    defaultPageSize: 12, // More items for grid view
  });

  const [allData, setAllData] = useState<List[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Fetch data using the standardized useFetch hook
  const { data, isLoading, isPlaceholderData } = useFetch<ListResponse<List>>(
    getAxiosForUseFetch,
    ["tagslist", page.toString(), pageSize.toString(), sortBy, sortOrder, JSON.stringify(filters), joinOperator],
    {
      url: { template: API_PATH.TAGS.LIST_TAGS },
      params: {
        page,
        limit: pageSize, // Use pageSize from useFilters
        sort_by: sortBy,
        sort_order: sortOrder,
        filters: JSON.stringify(filters),
        join_operator: joinOperator,
      },
    },
    {
       placeholderData: (previousData) => previousData,
    }
  );

  // Handle data appending for infinite scroll
  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAllData(data.data);
      } else {
        // Append unique items to avoid duplicates if any
        setAllData((prev) => {
          const newItems = data.data.filter(
            (newItem) => !prev.some((oldItem) => oldItem.id === newItem.id)
          );
          return [...prev, ...newItems];
        });
      }
      
      // Determine if there are more items
      setHasMore(allData.length + data.data.length < data.total);
    }
  }, [data, page]);

  // Reset data when filters or sorting change
  useEffect(() => {
    if (page === 1 && !isLoading) {
       // This is handled by page === 1 block above, but ensuring reset if filters change
    }
  }, [filters, sortBy, sortOrder]);

  const fetchMore = () => {
    if (!isLoading && hasMore) {
      setPage(page + 1);
    }
  };

  const handleEdit = (id: string | number) => {
    console.log("Edit tag:", id);
    // In the future, this will trigger the CreateList sheet with edit mode
  };

  const handleDelete = (id: string | number) => {
    console.log("Delete tag:", id);
    // In the future, this will trigger the PopupConfirm
  };

  return (
    <div className="w-full space-y-6">
      <InfiniteScroll<List>
        data={allData}
        renderItem={(tag) => (
          <TagCard
            key={tag.id}
            id={tag.id}
            title={tag.name}
            description={tag.description}
            contactCount={tag.contact_count}
            color={tag.color}
            onEdit={() => handleEdit(tag.id)}
            onDelete={() => handleDelete(tag.id)}
          />
        )}
        fetchMore={fetchMore}
        hasMore={hasMore}
        isLoading={isLoading}
        gridCols={{
          default: 1,
          sm: 2,
          md: 2,
          lg: 3,
          xl: 4,
        }}
        className="pb-10"
      />
    </div>
  );
}