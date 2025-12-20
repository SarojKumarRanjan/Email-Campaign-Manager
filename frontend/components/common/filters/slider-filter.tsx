"use client";

import { PlusCircle, XCircle } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export interface SliderFilterProps {
    title?: string;
    range?: [number, number];
    unit?: string;
    value?: number[];
    onValueChange?: (value: number[] | undefined) => void;
}

export function SliderFilter({
    title,
    range = [0, 100],
    unit,
    value,
    onValueChange,
}: SliderFilterProps) {
    const [open, setOpen] = React.useState(false);
    const [localValue, setLocalValue] = React.useState<number[]>(
        value ?? [range[0], range[1]],
    );

    React.useEffect(() => {
        if (value) {
            setLocalValue(value);
        }
    }, [value]);

    const isFiltered = value !== undefined && (value[0] !== range[0] || value[1] !== range[1]);

    const onReset = React.useCallback(
        (event?: React.MouseEvent) => {
            event?.stopPropagation();
            onValueChange?.(undefined);
            setLocalValue([range[0], range[1]]);
        },
        [onValueChange, range],
    );

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
                                {localValue[0]} - {localValue[1]}
                                {unit}
                            </Badge>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-4" align="start">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between text-sm">
                        <span>{localValue[0]}</span>
                        <span>{localValue[1]}</span>
                    </div>
                    <Slider
                        min={range[0]}
                        max={range[1]}
                        step={1}
                        value={localValue}
                        onValueChange={setLocalValue}
                        onValueCommit={onValueChange}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
}
