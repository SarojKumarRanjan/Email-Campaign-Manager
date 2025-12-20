"use client";

import { useQueryState } from "nuqs";
import { ArrowDownUp, ListFilter, RotateCcw, Settings2 } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parsers";
import { generateId } from "@/lib/id";
import { getDefaultFilterOperator } from "@/lib/data-table";
import { cn } from "@/lib/utils";
import type { ExtendedColumnFilter, ExtendedColumnSort } from "@/types/data-table";

import { FacetedFilter } from "../filters/faceted-filter";
import { DateFilter } from "../filters/date-filter";
import { SliderFilter } from "../filters/slider-filter";
import { BooleanFilter } from "../filters/boolean-filter";
import { RangeFilter } from "../filters/range-filter";
import { TextFilter } from "../filters/text-filter";
import { FilterList, type FilterField } from "../filters/filter-list";
import { SortList } from "../filters/sort-list";

interface CustomFilterProps {
    fields: FilterField[];
    initialVisibleFilters?: number;
    filterKey?: string;
    sortKey?: string;
    className?: string;
    // External state (optional)
    filters?: ExtendedColumnFilter<any>[] | null;
    setFilters?: (value: ExtendedColumnFilter<any>[] | null) => void;
    sort?: ExtendedColumnSort<any>[] | null;
    setSort?: (value: ExtendedColumnSort<any>[] | null) => void;
}

export function CustomFilter({
    fields,
    initialVisibleFilters = 3,
    filterKey = "filters",
    sortKey = "sort",
    className,
    filters: externalFilters,
    setFilters: externalSetFilters,
    sort: externalSort,
    setSort: externalSetSort,
}: CustomFilterProps) {
    const [toolbarMode, setToolbarMode] = React.useState<"simple" | "advanced">("simple");

    // Internal state with nuqs as fallback
    const [internalFilters, internalSetFilters] = useQueryState(filterKey, getFiltersStateParser());
    const [internalSort, internalSetSort] = useQueryState(sortKey, getSortingStateParser());

    const filters = externalFilters !== undefined ? externalFilters : internalFilters;
    const setFilters = externalSetFilters !== undefined ? externalSetFilters : internalSetFilters;
    const sort = externalSort !== undefined ? externalSort : internalSort;
    const setSort = externalSetSort !== undefined ? externalSetSort : internalSetSort;

    const isFiltered = (filters?.length ?? 0) > 0 || (sort?.length ?? 0) > 0;

    const onReset = React.useCallback(() => {
        setFilters(null);
        setSort(null);
    }, [setFilters, setSort]);

    // Progressive Disclosure for Simple Mode
    const visibleFields = fields.slice(0, initialVisibleFilters);
    const hiddenFields = fields.slice(initialVisibleFilters);

    const onSimpleFilterChange = React.useCallback((fieldId: string, value: any) => {
        const field = fields.find(f => f.id === fieldId);
        if (!field) return;

        const current = (filters ?? []) as ExtendedColumnFilter<any>[];
        const existing = current.find(f => f.id === fieldId);

        let next: ExtendedColumnFilter<any>[] | null = null;

        if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
            next = current.filter(f => f.id !== fieldId);
        } else if (existing) {
            next = current.map(f => f.id === fieldId ? { ...f, value } : f);
        } else {
            next = [...current, {
                id: fieldId as any,
                value,
                variant: field.variant,
                operator: getDefaultFilterOperator(field.variant),
                filterId: generateId({ length: 8 })
            }];
        }

        setFilters(next && next.length > 0 ? next : null);
    }, [fields, filters, setFilters]);

    return (
        <div className={cn("flex flex-col gap-4", className)}>
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                    {toolbarMode === "simple" ? (
                        <>
                            {visibleFields.map((field) => (
                                <SimpleFilterRenderer
                                    key={field.id}
                                    field={field}
                                    value={filters?.find(f => f.id === field.id)?.value}
                                    onChange={(val) => onSimpleFilterChange(field.id, val)}
                                />
                            ))}
                            {hiddenFields.length > 0 && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="border-dashed h-8">
                                            More Filters...
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-56">
                                        <DropdownMenuLabel>Add Filter</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {hiddenFields.map((field) => (
                                            <DropdownMenuItem
                                                key={field.id}
                                                onSelect={() => {
                                                    onSimpleFilterChange(field.id, undefined);
                                                }}
                                            >
                                                {field.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                            <Separator orientation="vertical" className="h-4 mx-1" />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8 border-dashed">
                                        <ArrowDownUp className="mr-2 h-4 w-4" />
                                        Sort
                                        {sort && sort.length > 0 && (
                                            <Badge variant="secondary" className="ml-2 h-4 px-1 rounded-sm">
                                                {sort.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-4" align="start">
                                    <SortList
                                        fields={fields.map(f => ({ id: f.id, label: f.label }))}
                                        sorts={sort ?? []}
                                        onSortsChange={setSort}
                                    />
                                </PopoverContent>
                            </Popover>
                        </>
                    ) : (
                        <>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8">
                                        <ListFilter className="mr-2 h-4 w-4" />
                                        Filters
                                        {filters && filters.length > 0 && (
                                            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                                                {filters.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[600px] p-4" align="start">
                                    <FilterList
                                        fields={fields}
                                        filters={filters ?? []}
                                        onFiltersChange={setFilters}
                                    />
                                </PopoverContent>
                            </Popover>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" size="sm" className="h-8">
                                        <ArrowDownUp className="mr-2 h-4 w-4" />
                                        Sort
                                        {sort && sort.length > 0 && (
                                            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                                                {sort.length}
                                            </Badge>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-4" align="start">
                                    <SortList
                                        fields={fields.map(f => ({ id: f.id, label: f.label }))}
                                        sorts={sort ?? []}
                                        onSortsChange={setSort}
                                    />
                                </PopoverContent>
                            </Popover>
                        </>
                    )}

                    {isFiltered && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 lg:px-3 text-muted-foreground hover:text-foreground"
                            onClick={onReset}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset
                        </Button>
                    )}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                            <Settings2 className="mr-2 h-4 w-4" />
                            View Mode
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>View Mode</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setToolbarMode("simple")} className={cn(toolbarMode === "simple" && "bg-accent text-accent-foreground")}>
                            Simple
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setToolbarMode("advanced")} className={cn(toolbarMode === "advanced" && "bg-accent text-accent-foreground")}>
                            Advanced
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

function SimpleFilterRenderer({
    field,
    value,
    onChange
}: {
    field: FilterField,
    value: any,
    onChange: (val: any) => void
}) {
    switch (field.variant) {
        case "text":
        case "number":
            if (field.options && field.options.length > 0) {
                return (
                    <FacetedFilter
                        title={field.label}
                        options={field.options}
                        value={value}
                        onValueChange={onChange}
                        multiple={false}
                    />
                );
            }
            return (
                <TextFilter
                    title={field.label}
                    value={value}
                    onValueChange={onChange}
                    placeholder={field.placeholder}
                    type={field.variant}
                />
            );
        case "select":
        case "multiSelect":
            return (
                <FacetedFilter
                    title={field.label}
                    options={field.options ?? []}
                    value={value}
                    onValueChange={onChange}
                    multiple={field.variant === "multiSelect"}
                />
            );
        case "date":
        case "dateRange":
            return (
                <DateFilter
                    title={field.label}
                    value={value}
                    onValueChange={onChange}
                    multiple={field.variant === "dateRange"}
                />
            );
        case "range":
            return (
                <RangeFilter
                    title={field.label}
                    min={field.range?.[0]}
                    max={field.range?.[1]}
                    unit={field.unit}
                    value={value}
                    onValueChange={onChange}
                />
            );
        case "boolean":
            return (
                <BooleanFilter
                    title={field.label}
                    value={value}
                    onValueChange={onChange}
                />
            );
        default:
            return null;
    }
}
