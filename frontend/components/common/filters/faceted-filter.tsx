"use client";

import { Check, PlusCircle, XCircle } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Option } from "@/types/data-table";

export interface FacetedFilterProps {
    title?: string;
    options: Option[];
    multiple?: boolean;
    value?: string | string[];
    onValueChange?: (value: string | string[] | undefined) => void;
}

export function FacetedFilter({
    title,
    options,
    multiple,
    value,
    onValueChange,
}: FacetedFilterProps) {
    const [open, setOpen] = React.useState(false);

    const selectedValues = new Set(
        Array.isArray(value) ? value : value ? [value] : [],
    );

    const onItemSelect = React.useCallback(
        (option: Option, isSelected: boolean) => {
            if (!onValueChange) return;

            if (multiple) {
                const newSelectedValues = new Set(selectedValues);
                if (isSelected) {
                    newSelectedValues.delete(option.value);
                } else {
                    newSelectedValues.add(option.value);
                }
                const filterValues = Array.from(newSelectedValues);
                onValueChange(filterValues.length ? filterValues : undefined);
            } else {
                onValueChange(isSelected ? undefined : option.value);
                setOpen(false);
            }
        },
        [multiple, selectedValues, onValueChange],
    );

    const onReset = React.useCallback(
        (event?: React.MouseEvent) => {
            event?.stopPropagation();
            onValueChange?.(undefined);
        },
        [onValueChange],
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-dashed font-normal h-8"
                >
                    {selectedValues?.size > 0 ? (
                        <div
                            role="button"
                            aria-label={`Clear ${title} filter`}
                            tabIndex={0}
                            className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mr-2"
                            onClick={onReset}
                        >
                            <XCircle className="size-4" />
                        </div>
                    ) : (
                        <PlusCircle className="size-4 mr-2" />
                    )}
                    {title}
                    {selectedValues?.size > 0 && (
                        <>
                            <Separator
                                orientation="vertical"
                                className="mx-2 data-[orientation=vertical]:h-4"
                            />
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal lg:hidden"
                            >
                                {selectedValues.size}
                            </Badge>
                            <div className="hidden items-center gap-1 lg:flex">
                                {selectedValues.size > 2 ? (
                                    <Badge
                                        variant="secondary"
                                        className="rounded-sm px-1 font-normal"
                                    >
                                        {selectedValues.size} selected
                                    </Badge>
                                ) : (
                                    options
                                        .filter((option) => selectedValues.has(option.value))
                                        .map((option) => (
                                            <Badge
                                                variant="secondary"
                                                key={option.value}
                                                className="rounded-sm px-1 font-normal"
                                            >
                                                {option.label}
                                            </Badge>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-50 p-0" align="start">
                <Command>
                    <CommandInput placeholder={title} />
                    <CommandList className="max-h-full">
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] scroll-py-1 overflow-y-auto overflow-x-hidden">
                            {options.map((option) => {
                                const isSelected = selectedValues.has(option.value);

                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => onItemSelect(option, isSelected)}
                                    >
                                        <div
                                            className={cn(
                                                "flex size-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary"
                                                    : "opacity-50 [&_svg]:invisible",
                                            )}
                                        >
                                            <Check className="size-3 text-primary-foreground" />
                                        </div>
                                        {option.icon && <option.icon className="mr-2 size-4" />}
                                        <span className="truncate">{option.label}</span>
                                        {option.count && (
                                            <span className="ml-auto font-mono text-xs">
                                                {option.count}
                                            </span>
                                        )}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {selectedValues.size > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem
                                        onSelect={() => onReset()}
                                        className="justify-center text-center"
                                    >
                                        Clear filters
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
