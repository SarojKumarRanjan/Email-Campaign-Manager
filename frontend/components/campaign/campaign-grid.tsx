"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { InfiniteScroll } from "@/components/common/infinite-scroll";
import { CampaignCard } from "./campaign-card";
import { useFilters } from "@/hooks/usefilters";
import { useFetch } from "@/hooks/useApiCalls";
import { getAxiosForUseFetch } from "@/lib/axios";
import API_PATH from "@/lib/apiPath";
import { Campaign } from "@/types/campaign";
import { ListResponse } from "@/types";

export interface CampaignGridProps {
    // Optional: if we want to control filters from outside later
}

export const CampaignGrid = () => {
    const {
        page,
        setPage,
        pageSize,
        sortBy,
        sortOrder,
        filters,
        joinOperator,
    } = useFilters<Campaign>({
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultPageSize: 10,
    });

    const [allData, setAllData] = useState<Campaign[]>([]);
    const [hasMore, setHasMore] = useState(true);

    const filtersJson = useMemo(() => JSON.stringify(filters), [filters]);

    const { data, isLoading, isPlaceholderData, error } = useFetch<ListResponse<Campaign>>(
        getAxiosForUseFetch,
        [
            "campaigns",
            page.toString(),
            pageSize.toString(),
            sortBy,
            sortOrder,
            filtersJson,
            joinOperator,
        ],
        {
            url: { template: API_PATH.CAMPAIGNS.LIST_CAMPAIGNS },
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

    // Reset data when filters change
    useEffect(() => {
        setPage(1);
        setAllData([]);
        setHasMore(true);
    }, [sortBy, sortOrder, filtersJson, joinOperator, pageSize, setPage]);

    // Handle data appending
    useEffect(() => {
        if (!data?.data) return;

        if (page === 1) {
            setAllData(data.data);
        } else {
            setAllData((prev) => {
                const existingIds = new Set(prev.map((item) => item.id));
                const newItems = data.data.filter((item) => !existingIds.has(item.id));
                return [...prev, ...newItems];
            });
        }
        
        const totalFetched = (page - 1) * pageSize + data.data.length;
        setHasMore(data.data.length === pageSize && totalFetched < data.total);
    }, [data, page, pageSize]);

    const fetchMore = useCallback(() => {
        if (!isLoading && hasMore && !isPlaceholderData) {
            setPage((prev) => prev + 1);
        }
    }, [isLoading, hasMore, isPlaceholderData, setPage]);

    const keyExtractor = useCallback((item: Campaign) => item.id.toString(), []);

    if (error) {
         return (
             <div className="w-full text-center py-10 text-red-500">
                 Failed to load campaigns. Please try again.
             </div>
         )
    }

    return (
        <div className="w-full space-y-4">
             {/* Loading Skeletons for initial load */}
             {isLoading && page === 1 && allData.length === 0 && (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                         <CampaignCard key={i} isLoading={true} />
                    ))}
                </div>
             )}

            <InfiniteScroll<Campaign>
                data={allData}
                renderItem={(campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                )}
                fetchMore={fetchMore}
                hasMore={hasMore}
                isLoading={isLoading}
                className="pb-10 space-y-4" // Vertical stack for full-width cards
                keyExtractor={keyExtractor}
                emptyStateMessage="No campaigns found. Create your first campaign to get started."
                loader={<CampaignCard isLoading={true} />}
            />
        </div>
    );
};
