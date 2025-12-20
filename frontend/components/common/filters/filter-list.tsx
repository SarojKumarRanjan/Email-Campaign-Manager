"use client";

import {
    CalendarIcon,
    Check,
    ChevronsUpDown,
    GripVertical,
    Plus,
    Trash2,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Faceted,
    FacetedBadgeList,
    FacetedContent,
    FacetedEmpty,
    FacetedGroup,
    FacetedInput,
    FacetedItem,
    FacetedList,
    FacetedTrigger,
} from "@/components/ui/faceted";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sortable,
    SortableContent,
    SortableItem,
    SortableItemHandle,
} from "@/components/ui/sortable";
import { dataTableConfig } from "@/config/data-table";
import { getDefaultFilterOperator, getFilterOperators } from "@/lib/data-table";
import { formatDate } from "@/lib/format";
import { generateId } from "@/lib/id";
import { cn } from "@/lib/utils";
import type {
    ExtendedColumnFilter,
    FilterOperator,
    Option,
    FilterVariant,
} from "@/types/data-table";

export interface FilterField {
    id: string;
    label: string;
    variant: FilterVariant;
    options?: Option[];
    placeholder?: string;
    unit?: string;
    range?: [number, number];
}

interface FilterListProps {
    fields: FilterField[];
    filters: ExtendedColumnFilter<any>[];
    onFiltersChange: (filters: ExtendedColumnFilter<any>[]) => void;
}

export function FilterList({
    fields,
    filters,
    onFiltersChange,
}: FilterListProps) {
    const onFilterAdd = React.useCallback(() => {
        const field = fields[0];
        if (!field) return;

        onFiltersChange([
            ...filters,
            {
                id: field.id,
                value: "",
                variant: field.variant,
                operator: getDefaultFilterOperator(field.variant),
                filterId: generateId({ length: 8 }),
            },
        ]);
    }, [fields, filters, onFiltersChange]);

    const onFilterUpdate = React.useCallback(
        (
            filterId: string,
            updates: Partial<Omit<ExtendedColumnFilter<any>, "filterId">>,
        ) => {
            const updatedFilters = filters.map((filter) => {
                if (filter.filterId === filterId) {
                    return { ...filter, ...updates } as ExtendedColumnFilter<any>;
                }
                return filter;
            });
            onFiltersChange(updatedFilters);
        },
        [filters, onFiltersChange],
    );

    const onFilterRemove = React.useCallback(
        (filterId: string) => {
            onFiltersChange(filters.filter(f => f.filterId !== filterId));
        },
        [filters, onFiltersChange],
    );

    return (
        <div className="flex flex-col gap-2">
            <Sortable
                value={filters}
                onValueChange={onFiltersChange}
                getItemValue={(item) => item.filterId}
            >
                <SortableContent className="flex flex-col gap-2">
                    {filters.map((filter, index) => (
                        <FilterItem
                            key={filter.filterId}
                            filter={filter}
                            fields={fields}
                            onUpdate={onFilterUpdate}
                            onRemove={onFilterRemove}
                        />
                    ))}
                </SortableContent>
            </Sortable>
            <Button
                variant="outline"
                size="sm"
                className="w-fit h-8"
                onClick={onFilterAdd}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Filter
            </Button>
        </div>
    );
}

function FilterItem({
    filter,
    fields,
    onUpdate,
    onRemove,
}: {
    filter: ExtendedColumnFilter<any>;
    fields: FilterField[];
    onUpdate: (id: string, updates: any) => void;
    onRemove: (id: string) => void;
}) {
    const field = fields.find((f) => f.id === filter.id);
    const operators = getFilterOperators(filter.variant ?? "text");

    return (
        <div className="flex items-center gap-2">
            <SortableItemHandle asChild>
                <Button variant="ghost" size="icon" className="h-8 w-6 cursor-grab">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
            </SortableItemHandle>

            <Select
                value={filter.id}
                onValueChange={(value) => {
                    const newField = fields.find((f) => f.id === value);
                    if (newField) {
                        onUpdate(filter.filterId, {
                            id: value,
                            variant: newField.variant,
                            operator: getDefaultFilterOperator(newField.variant),
                            value: "",
                        });
                    }
                }}
            >
                <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {fields.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                            {f.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={filter.operator}
                onValueChange={(value: FilterOperator) =>
                    onUpdate(filter.filterId, { operator: value })
                }
            >
                <SelectTrigger className="h-8 w-[120px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {operators.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                            {op.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="flex-1 min-w-[150px]">
                <FilterInput
                    filter={filter}
                    field={field}
                    onUpdate={(value) => onUpdate(filter.filterId, { value })}
                />
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => onRemove(filter.filterId)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}

function FilterInput({
    filter,
    field,
    onUpdate,
}: {
    filter: ExtendedColumnFilter<any>;
    field?: FilterField;
    onUpdate: (value: any) => void;
}) {
    if (filter.operator === "isEmpty" || filter.operator === "isNotEmpty") {
        return <div className="h-8 w-full bg-muted/50 rounded-md border border-dashed" />;
    }

    switch (filter.variant) {
        case "text":
        case "number":
            return (
                <Input
                    className="h-8"
                    type={filter.variant === "number" ? "number" : "text"}
                    placeholder={field?.placeholder ?? "Value..."}
                    value={(filter.value as string) ?? ""}
                    onChange={(e) => onUpdate(e.target.value)}
                />
            );

        case "range":
            const rangeValues = Array.isArray(filter.value) ? filter.value : ["", ""];
            return (
                <div className="flex items-center gap-1">
                    <Input
                        className="h-8 flex-1"
                        type="number"
                        placeholder="Min"
                        value={rangeValues[0]}
                        onChange={(e) => onUpdate([e.target.value, rangeValues[1]])}
                    />
                    <Input
                        className="h-8 flex-1"
                        type="number"
                        placeholder="Max"
                        value={rangeValues[1]}
                        onChange={(e) => onUpdate([rangeValues[0], e.target.value])}
                    />
                </div>
            );

        case "boolean":
            return (
                <Select
                    value={filter.value as string}
                    onValueChange={onUpdate}
                >
                    <SelectTrigger className="h-8 w-full">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                </Select>
            );

        case "select":
        case "multiSelect":
            return (
                <Faceted
                    value={filter.value as any}
                    onValueChange={onUpdate}
                    multiple={filter.variant === "multiSelect"}
                >
                    <FacetedTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-full justify-start font-normal">
                            <FacetedBadgeList options={field?.options} placeholder={field?.placeholder} />
                        </Button>
                    </FacetedTrigger>
                    <FacetedContent>
                        <FacetedInput placeholder="Search..." />
                        <FacetedList>
                            <FacetedEmpty>No results.</FacetedEmpty>
                            <FacetedGroup>
                                {field?.options?.map((opt) => (
                                    <FacetedItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </FacetedItem>
                                ))}
                            </FacetedGroup>
                        </FacetedList>
                    </FacetedContent>
                </Faceted>
            );

        case "date":
        case "dateRange":
            const dates = Array.isArray(filter.value) ? filter.value : [filter.value];
            const start = dates[0] ? new Date(Number(dates[0])) : undefined;
            const end = dates[1] ? new Date(Number(dates[1])) : undefined;

            return (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-full justify-start font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {start ? (
                                filter.variant === "dateRange" && end ? (
                                    `${formatDate(start)} - ${formatDate(end)}`
                                ) : (
                                    formatDate(start)
                                )
                            ) : (
                                field?.placeholder ?? "Pick date"
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        {filter.variant === "dateRange" ? (
                            <Calendar
                                mode="range"
                                selected={{ from: start, to: end }}
                                onSelect={(range) => {
                                    if (!range) return;
                                    onUpdate([
                                        range.from?.getTime().toString() ?? "",
                                        range.to?.getTime().toString() ?? "",
                                    ]);
                                }}
                                numberOfMonths={2}
                            />
                        ) : (
                            <Calendar
                                mode="single"
                                selected={start}
                                onSelect={(date) => {
                                    if (!date) return;
                                    onUpdate(date.getTime().toString());
                                }}
                            />
                        )}
                    </PopoverContent>
                </Popover>
            );

        default:
            return null;
    }
}
