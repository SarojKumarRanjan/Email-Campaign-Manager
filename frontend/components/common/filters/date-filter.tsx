"use client";

import { CalendarIcon, PlusCircle, XCircle } from "lucide-react";
import * as React from "react";
import type { DateRange } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface DateFilterProps {
    title?: string;
    multiple?: boolean;
    value?: string | string[];
    onValueChange?: (value: string | string[] | undefined) => void;
}

export function DateFilter({
    title,
    multiple,
    value,
    onValueChange,
}: DateFilterProps) {
    const [open, setOpen] = React.useState(false);

    const dateValue = Array.isArray(value)
        ? value.filter(Boolean)
        : [value].filter(Boolean);

    const startDate = dateValue[0] ? new Date(Number(dateValue[0])) : undefined;
    const endDate = dateValue[1] ? new Date(Number(dateValue[1])) : undefined;

    const isSameDate =
        startDate &&
        endDate &&
        startDate.toDateString() === endDate.toDateString();

    const displayValue =
        multiple && dateValue.length === 2 && !isSameDate
            ? `${formatDate(startDate, { month: "short" })} - ${formatDate(endDate, { month: "short" })}`
            : startDate
                ? formatDate(startDate, { month: "short" })
                : title;

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
                    {dateValue.length > 0 ? (
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
                    {dateValue.length > 0 && (
                        <>
                            <Separator
                                orientation="vertical"
                                className="mx-2 data-[orientation=vertical]:h-4"
                            />
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal"
                            >
                                {displayValue}
                            </Badge>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                {multiple ? (
                    <Calendar
                        aria-label={`Select ${title} date range`}
                        autoFocus
                        captionLayout="dropdown"
                        mode="range"
                        selected={{
                            from: startDate,
                            to: endDate,
                        }}
                        onSelect={(date: DateRange | undefined) => {
                            if (!date) return;
                            onValueChange?.([
                                (date.from ?? new Date()).getTime().toString(),
                                (date.to ?? date.from ?? new Date()).getTime().toString(),
                            ]);
                        }}
                        numberOfMonths={2}
                    />
                ) : (
                    <Calendar
                        aria-label={`Select ${title} date`}
                        autoFocus
                        captionLayout="dropdown"
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                            if (!date) return;
                            onValueChange?.(date.getTime().toString());
                            setOpen(false);
                        }}
                    />
                )}
            </PopoverContent>
        </Popover>
    );
}
