"use client";

import * as React from "react";
import NoDataFound from "./no-data-found";
import Loading from "./loading";

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
  
  /** Custom end message when no more items */
  endMessage?: React.ReactNode;
  
  /** Container className */
  className?: string;
  
  /** Item container className */
  itemClassName?: string;
  
  /** Grid columns for responsive grid layout (optional) */
  gridCols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function InfiniteScroll<T>({
  data,
  renderItem,
  fetchMore,
  hasMore,
  isLoading = false,
  threshold = 300,
  loader,
  endMessage,
  className = "",
  itemClassName = "",
  gridCols,
}: InfiniteScrollProps<T>) {
  const observerTarget = React.useRef<HTMLDivElement>(null);
  const [isFetching, setIsFetching] = React.useState(false);

  React.useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget || !hasMore || isLoading || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isFetching) {
          setIsFetching(true);
          fetchMore();
          // Reset fetching state after a delay to prevent multiple rapid calls
          setTimeout(() => setIsFetching(false), 500);
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    observer.observe(currentTarget);

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, isFetching, fetchMore, threshold]);

  // Generate grid class names from gridCols prop
  const getGridClassName = () => {
    if (!gridCols) return "";
    
    const classes = ["grid gap-4"];
    
    if (gridCols.default) classes.push(`grid-cols-${gridCols.default}`);
    if (gridCols.sm) classes.push(`sm:grid-cols-${gridCols.sm}`);
    if (gridCols.md) classes.push(`md:grid-cols-${gridCols.md}`);
    if (gridCols.lg) classes.push(`lg:grid-cols-${gridCols.lg}`);
    if (gridCols.xl) classes.push(`xl:grid-cols-${gridCols.xl}`);
    
    return classes.join(" ");
  };

  const defaultLoader = (
    <div className="flex items-center justify-center py-8">
      <Loading />
    </div>
  );

  const defaultEndMessage = (
    <div className="text-center py-8 text-muted-foreground">
     <NoDataFound />
    </div>
  );

  return (
    <div className={className}>
      {/* Items Container */}
      <div className={gridCols ? getGridClassName() : itemClassName}>
        {data.map((item, index) => (
          <React.Fragment key={index}>
            {renderItem(item, index)}
          </React.Fragment>
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (loader || defaultLoader)}

      {/* Observer Target - invisible element to trigger loading */}
      {hasMore && !isLoading && (
        <div ref={observerTarget} className="h-10" />
      )}

      {/* End Message */}
      {!hasMore && data.length > 0 && (endMessage || defaultEndMessage)}

      {/* Empty State */}
      {!isLoading && data.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
         <NoDataFound />
        </div>
      )}
    </div>
  );
}
