"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { InfiniteScroll } from "@/components/common/infinite-scroll";
import { TemplateCard } from "./template-card";
import { useFilters } from "@/hooks/usefilters";
import { useFetch, useConfigurableMutation } from "@/hooks/useApiCalls";
import { getAxiosForUseFetch, deleteAxiosForUseFetch, postAxiosForUseFetch } from "@/lib/axios";
import API_PATH from "@/lib/apiPath";
import { Template, TemplateListResponse } from "@/types/template";
import PopupConfirm from "@/components/common/popup-confirm";

export interface TemplateGridProps {
    onEditTemplate?: (templateId: number) => void;
}

export const TemplateGrid = ({ onEditTemplate }: TemplateGridProps) => {
    const {
        page,
        setPage,
        pageSize,
        sortBy,
        sortOrder,
        filters,
        joinOperator,
    } = useFilters<Template>({
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultPageSize: 12,
    });

    const [allData, setAllData] = useState<Template[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

    const filtersJson = useMemo(() => JSON.stringify(filters), [filters]);

    const { data, isLoading, isPlaceholderData, error, refetch } = useFetch<TemplateListResponse>(
        getAxiosForUseFetch,
        [
            "templates",
            page.toString(),
            pageSize.toString(),
            sortBy,
            sortOrder,
            filtersJson,
            joinOperator,
        ],
        {
            url: { template: API_PATH.TEMPLATES.LIST_TEMPLATES },
            params: {
                page,
                limit: pageSize,
                sort_by: sortBy,
                sort_order: sortOrder,
            },
        }
    );

    const deleteMutation = useConfigurableMutation(
        deleteAxiosForUseFetch,
        ["templates"],
        {
            onSuccess: () => {
                setDeleteConfirmId(null);
                // Remove from local state
                setAllData(prev => prev.filter(t => t.id !== deleteConfirmId));
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

    // Reset data when filters change
    useEffect(() => {
        setPage(1);
        setAllData([]);
        setHasMore(true);
    }, [sortBy, sortOrder, filtersJson, joinOperator, pageSize, setPage]);

    console.log(data);
    // Handle data appending
    useEffect(() => {
        if (!data) return;

        if (page === 1) {
            setAllData(data);
        } else {
            setAllData((prev) => {
                const existingIds = new Set(prev.map((item) => item.id));
                const newItems = data.filter((item) => !existingIds.has(item.id));
                return [...prev, ...newItems];
            });
        }
        
        const totalFetched = (page - 1) * pageSize + data.length;
        setHasMore(data.length === pageSize && totalFetched < data.total);
    }, [data, page, pageSize]);

    const fetchMore = useCallback(() => {
        if (!isLoading && hasMore && !isPlaceholderData) {
            setPage((prev) => prev + 1);
        }
    }, [isLoading, hasMore, isPlaceholderData, setPage]);

    const keyExtractor = useCallback((item: Template) => item.id.toString(), []);

    const handleDelete = (id: number) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = () => {
        if (deleteConfirmId) {
            deleteMutation.mutate({
                url: { 
                    template: API_PATH.TEMPLATES.DELETE_TEMPLATE, 
                    variables: [deleteConfirmId.toString()] 
                },
            });
        }
    };

    const handleDuplicate = (id: number) => {
        duplicateMutation.mutate({
            url: { 
                template: API_PATH.TEMPLATES.DUPLICATE_TEMPLATE, 
                variables: [id.toString()] 
            },
        });
    };

    const handleSetDefault = (id: number) => {
        setDefaultMutation.mutate({
             url: { 
                template: API_PATH.TEMPLATES.SET_DEFAULT_TEMPLATE, 
                variables: [id.toString()] 
            },
        });
    };

    if (error) {
        return (
            <div className="w-full text-center py-10 text-red-500">
                Failed to load templates. Please try again.
            </div>
        );
    }

    console.log(allData);

    return (
        <div className="w-full space-y-4">
            {/* Loading Skeletons for initial load */}
            {isLoading && page === 1 && allData.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <TemplateCard key={i} isLoading={true} />
                    ))}
                </div>
            )}

            <InfiniteScroll<Template>
                data={allData}
                renderItem={(template) => (
                    <TemplateCard 
                        key={template.id} 
                        template={template}
                        onEdit={onEditTemplate}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                        onSetDefault={handleSetDefault}
                    />
                )}
                fetchMore={fetchMore}
                hasMore={hasMore}
                isLoading={isLoading}
                gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                className="pb-10"
                keyExtractor={keyExtractor}
                emptyStateMessage="No templates found. Create your first template to get started."
                loader={<TemplateCard isLoading={true} />}
            />

            <PopupConfirm
                open={!!deleteConfirmId}
                onOpenChange={(open) => !open && setDeleteConfirmId(null)}
                onProceed={confirmDelete}
                title="Delete Template"
                description="Are you sure you want to delete this template? This action cannot be undone."
                proceedText="Delete"
                cancelText="Cancel"
                variant="error"
                loading={deleteMutation.isPending}
            />
        </div>
    );
};
