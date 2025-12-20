"use client";

import * as React from "react";
import { PlusCircle, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface RangeFilterProps {
    title?: string;
    value?: string[];
    onValueChange?: (value: string[] | undefined) => void;
    min?: number;
    max?: number;
    unit?: string;
}

export function RangeFilter({
    title,
    value = ["", ""],
    onValueChange,
    min = 0,
    max = 1000,
    unit,
}: RangeFilterProps) {
    const [open, setOpen] = React.useState(false);

    const isFiltered = value && (value[0] !== "" || value[1] !== "");

    const onReset = React.useCallback(
        (event?: React.MouseEvent) => {
            event?.stopPropagation();
            onValueChange?.(undefined);
        },
        [onValueChange],
    );

    const onMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange?.([e.target.value, value[1] ?? ""]);
    };

    const onMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange?.([value[0] ?? "", e.target.value]);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="border-dashed font-normal h-8"
                >
                    {isFiltered ? (
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
                    {isFiltered && (
                        <>
                            <Separator
                                orientation="vertical"
                                className="mx-2 data-[orientation=vertical]:h-4"
                            />
                            <Badge
                                variant="secondary"
                                className="rounded-sm px-1 font-normal"
                            >
                                {value[0] || min} - {value[1] || max} {unit}
                            </Badge>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-4" align="start">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 space-y-1">
                            <span className="text-[10px] uppercase text-muted-foreground font-semibold">Min</span>
                            <Input
                                type="number"
                                placeholder={min.toString()}
                                value={value[0]}
                                onChange={onMinChange}
                                className="h-8"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <span className="text-[10px] uppercase text-muted-foreground font-semibold">Max</span>
                            <Input
                                type="number"
                                placeholder={max.toString()}
                                value={value[1]}
                                onChange={onMaxChange}
                                className="h-8"
                            />
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
