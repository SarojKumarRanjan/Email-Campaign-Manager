import {
    useQueryState,
    parseAsInteger,
    parseAsString,
    parseAsJson,
    type Parser,
} from "nuqs";
import type { ExtendedColumnFilter } from "@/types/data-table";

interface UseDataTableFiltersOptions<TData> {
    defaultPage?: number;
    defaultPageSize?: number;
    defaultSortBy?: string;
    defaultSortOrder?: "asc" | "desc";
    defaultFilters?: ExtendedColumnFilter<TData>[];
    defaultJoinOperator?: "and" | "or";
}

export function useDataTableFilters<TData = unknown>(
    options: UseDataTableFiltersOptions<TData> = {}
) {
    const {
        defaultPage = 1,
        defaultPageSize = 5,
        defaultSortBy = "created_at",
        defaultSortOrder = "desc",
        defaultFilters = [],
        defaultJoinOperator = "and",
    } = options;

    const [page, setPage] = useQueryState(
        "page",
        parseAsInteger.withDefault(defaultPage)
    );
    const [pageSize, setPageSize] = useQueryState(
        "per_page",
        parseAsInteger.withDefault(defaultPageSize)
    );
    const [sortBy, setSortBy] = useQueryState(
        "sort_by",
        parseAsString.withDefault(defaultSortBy)
    );

    const [sortOrder, setSortOrder] = useQueryState(
        "sort_order",
        parseAsString.withDefault(defaultSortOrder)
    );
    const [filters, setFilters] = useQueryState<ExtendedColumnFilter<TData>[]>(
        "filters",
        parseAsJson<ExtendedColumnFilter<TData>[]>((v) => v as ExtendedColumnFilter<TData>[]).withDefault(defaultFilters)
    );
    const [joinOperator, setJoinOperator] = useQueryState(
        "joinOperator",
        parseAsString.withDefault(defaultJoinOperator)
    );

    return {
        // Pagination
        page,
        setPage,
        pageSize,
        setPageSize,
        // Sorting
        sortBy,
        setSortBy,
        sortOrder: sortOrder as "asc" | "desc",
        setSortOrder,
        // Filtering
        filters,
        setFilters,
        joinOperator: joinOperator as "and" | "or",
        setJoinOperator,
    };
}
