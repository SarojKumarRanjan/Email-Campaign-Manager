"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Date Range Picker ---

interface DatePickerWithRangeProps {
    value?: DateRange;
    onChange: (date: DateRange | undefined) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
}

export function DatePickerWithRange({
    className,
    value,
    onChange,
    placeholder,
    disabled
}: DatePickerWithRangeProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground"
                        )}
                        disabled={disabled}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value?.from ? (
                            value.to ? (
                                <>
                                    {format(value.from, "LLL dd, y")} -{" "}
                                    {format(value.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(value.from, "LLL dd, y")
                            )
                        ) : (
                            <span>{placeholder || "Pick a date"}</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={value?.from}
                        selected={value}
                        onSelect={onChange}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

// --- Time Picker ---

interface TimePickerProps {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
}

export function TimePicker({ value, onChange, disabled, className }: TimePickerProps) {
    // Generate time options (every 15 mins)
    const times = React.useMemo(() => {
        const result = [];
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 60; j += 15) {
                const hour = i.toString().padStart(2, '0');
                const minute = j.toString().padStart(2, '0');
                result.push(`${hour}:${minute}`);
            }
        }
        return result;
    }, []);

    return (
        <Select
            value={value}
            onValueChange={onChange}
            disabled={disabled}
        >
            <SelectTrigger className={cn("w-full", className)}>
                <Clock className="mr-2 h-4 w-4 opacity-50" />
                <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
                {times.map((time) => (
                    <SelectItem key={time} value={time}>
                        {time}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
