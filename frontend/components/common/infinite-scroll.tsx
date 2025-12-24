"use client";

import * as React from "react";
import NoDataFound from "./no-data-found";
import Loading from "./loading";
import { cn } from "@/lib/utils";

export interface InfiniteScrollProps<T> {
  /** Array of data items to render */
  data: T[];
  
  /** Function to render each item */
  renderItem: (item: T, index: number) => React.ReactNode;
  
  /** Function to fetch more data when scrolling to bottom */
  fetchMore: () => void;
  
  /** Whether there are more items to load */
  hasMore: boolean;
  
  /** Whether data is currently being loaded */
  isLoading?: boolean;
  
  /** Threshold for triggering load (in pixels from bottom) */
  threshold?: number;
  
  /** Custom loader component */
  loader?: React.ReactNode;
  
  /** Container className */
  className?: string;
  
  /** Item container className */
  itemClassName?: string;
  
  /** Custom empty state message */
  emptyStateMessage?: string;

  /** Unique key extractor function */
  keyExtractor?: (item: T, index: number) => string | number;
}

export function InfiniteScroll<T>({
  data,
  renderItem,
  fetchMore,
  hasMore,
  isLoading = false,
  threshold = 400,
  loader,
  className = "",
  itemClassName = "",
  emptyStateMessage,
  keyExtractor = (_, index) => index,
}: InfiniteScrollProps<T>) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const observerTarget = React.useRef<HTMLDivElement>(null);
  const [internalIsFetching, setInternalIsFetching] = React.useState(false);

  const gridClassName = React.useMemo(
    () => cn(
      "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
      itemClassName
    ),
    [itemClassName]
  );

  // Intersection Observer for infinite scroll
  React.useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget || !hasMore || isLoading || internalIsFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !internalIsFetching) {
          setInternalIsFetching(true);
          fetchMore();
        }
      },
      { rootMargin: `0px 0px ${threshold}px 0px` }
    );

    observer.observe(currentTarget);
    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
      observer.disconnect();
    };
  }, [hasMore, isLoading, internalIsFetching, fetchMore, threshold]);

  // Reset fetching state when loading completes
  React.useEffect(() => {
    if (!isLoading && internalIsFetching) {
      const timer = setTimeout(() => setInternalIsFetching(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, internalIsFetching]);

  const defaultLoader = React.useMemo(
    () => (
      <div className="flex items-center justify-center py-8 w-full">
        <Loading />
      </div>
    ),
    []
  );

  // Show loading for initial load
  if (isLoading && data.length === 0) {
    return (
      <div ref={containerRef} className={cn("w-full", className)}>
        {loader || defaultLoader}
      </div>
    );
  }

  // Show empty state
  if (!isLoading && data.length === 0) {
    return (
      <div ref={containerRef} className={cn("w-full", className)}>
        <div className="text-center py-12 text-muted-foreground w-full">
          {emptyStateMessage ? (
            <p>{emptyStateMessage}</p>
          ) : (
            <NoDataFound />
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <div className={gridClassName}>
        {data.map((item, index) => (
          <div key={keyExtractor(item, index)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && data.length > 0 && (loader || defaultLoader)}

      {/* Observer Target for triggering next page load */}
      {hasMore && !isLoading && data.length > 0 && (
        <div ref={observerTarget} className="h-4 w-full" aria-hidden="true" />
      )}
    </div>
  );
}