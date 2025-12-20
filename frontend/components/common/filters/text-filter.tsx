"use client";

import * as React from "react";
import { PlusCircle, Search, XCircle } from "lucide-react";

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

export interface TextFilterProps {
    title?: string;
    value?: string;
    onValueChange?: (value: string | undefined) => void;
    placeholder?: string;
    type?: "text" | "number";
}

export function TextFilter({
    title,
    value,
    onValueChange,
    placeholder = "Search...",
    type = "text",
}: TextFilterProps) {
    const [open, setOpen] = React.useState(false);

    const isFiltered = value !== undefined && value !== "";

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
                                className="rounded-sm px-1 font-normal max-w-[100px] truncate"
                            >
                                {value}
                            </Badge>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-2" align="start">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
                        <Input
                            type={type}
                            placeholder={placeholder}
                            value={value ?? ""}
                            onChange={(e) => onValueChange?.(e.target.value)}
                            className="h-8 pl-7"
                            autoFocus
                        />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
