"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export type Option = {
    label: string;
    value: string;
};

// --- Multi Select ---

interface MultiSelectProps {
    options: Option[];
    value?: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function MultiSelect({
    options,
    value = [],
    onChange,
    placeholder = "Select items...",
    disabled,
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (item: string) => {
        onChange(value.filter((i) => i !== item));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-auto min-h-9 px-3 py-1",
                        !value.length && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <div className="flex flex-wrap gap-1">
                        {value.length > 0 ? (
                            value.map((itemValue) => {
                                const option = options.find((o) => o.value === itemValue);
                                return (
                                    <Badge
                                        key={itemValue}
                                        variant="secondary"
                                        className="mr-1 mb-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnselect(itemValue);
                                        }}
                                    >
                                        {option?.label ?? itemValue}
                                        <div
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleUnselect(itemValue);
                                                }
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleUnselect(itemValue);
                                            }}
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </div>
                                    </Badge>
                                );
                            })
                        ) : (
                            <span className="py-0.5">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        <CommandEmpty>No item found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => {
                                        onChange(
                                            value.includes(option.value)
                                                ? value.filter((i) => i !== option.value)
                                                : [...value, option.value]
                                        );
                                        setOpen(true);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value.includes(option.value)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

// --- Async Select (Simplified) ---
// For a robust async select, usually react-select-async or custom logic with useEffect is used.
// Here we implement a simple debounced fetcher.

interface AsyncSelectProps {
    loadOptions: (inputValue: string) => Promise<Option[]>;
    value?: string | string[]; // Single or Multi
    onChange: (value: any) => void;
    isMulti?: boolean;
    placeholder?: string;
    disabled?: boolean;
    defaultOptions?: Option[]; // Initial options
    className?: string;
}

export function AsyncSelect({
    loadOptions,
    value,
    onChange,
    isMulti = false,
    placeholder = "Search...",
    disabled,
    defaultOptions = [],
    className,
}: AsyncSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState<Option[]>(defaultOptions);
    const [loading, setLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");

    // Debounce Search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (!searchTerm && defaultOptions.length > 0) {
                setOptions(defaultOptions);
                return;
            }
            if (!searchTerm) return;

            setLoading(true);
            loadOptions(searchTerm)
                .then((opts) => setOptions(opts))
                .finally(() => setLoading(false));
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [searchTerm, loadOptions, defaultOptions]);

    // Setup value display
    const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);

    const handleSelect = (itemValue: string) => {
        if (isMulti) {
            const current = (value as string[]) || [];
            if (current.includes(itemValue)) {
                onChange(current.filter(i => i !== itemValue));
            } else {
                onChange([...current, itemValue]);
            }
        } else {
            onChange(itemValue);
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    disabled={disabled}
                >
                    <div className="flex flex-wrap gap-1 items-center truncated">
                        {selectedValues.length > 0 ? (
                            selectedValues.map(val => {
                                // Try to find label in current options, or fallback to value (ideal would be to keep label in state)
                                const opt = options.find(o => o.value === val) || defaultOptions.find(o => o.value === val);
                                return isMulti ? (
                                    <Badge key={val} variant="secondary" className="mr-1">{opt?.label ?? val}</Badge>
                                ) : (
                                    <span key={val}>{opt?.label ?? val}</span>
                                )
                            })
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                    {/* We disable local filtering because it's async */}
                    <CommandInput
                        placeholder="Type to search..."
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList>
                        {loading && <div className="py-6 text-center text-sm text-muted-foreground">Loading...</div>}
                        {!loading && options.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedValues.includes(option.value)
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
