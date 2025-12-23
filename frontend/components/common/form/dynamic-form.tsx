"use client";

import * as React from "react";
import { useFormContext, type UseFormReturn, type FieldValues, type Path, type ControllerRenderProps } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

// New Components
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RichTextEditor } from "./rich-text-editor";
import { DatePickerWithRange, TimePicker } from "./date-time-picker";
import { MultiSelect, AsyncSelect, type Option } from "./multi-select";

// --- Types ---

export type FieldType =
    | "text"
    | "number"
    | "email"
    | "password"
    | "textarea"
    | "select"
    | "radio"
    | "checkbox"
    | "switch"
    | "date"
    | "date-range"
    | "time"
    | "multi-select"
    | "async-select"
    | "editor"
    | "color"
    | "custom";

export interface FieldConfig<TFieldValues extends FieldValues> {
    name: Path<TFieldValues>;
    label?: string;
    type: FieldType;
    placeholder?: string;
    description?: string;
    disabled?: boolean;
    className?: string; // Custom class for the container
    cols?: number;      // Grid Columns (1-12), defaults to 12 (full width)

    // Type specific props
    options?: Option[]; // For Select, Radio, MultiSelect
    loadOptions?: (inputValue: string) => Promise<Option[]>; // For AsyncSelect
    defaultOptions?: Option[]; // For AsyncSelect initial
    isMulti?: boolean; // For AsyncSelect

    render?: (props: { field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>; form: UseFormReturn<TFieldValues> }) => React.ReactNode;
}

export interface DynamicFormProps<TFieldValues extends FieldValues> {
    form: UseFormReturn<TFieldValues>;
    fields: FieldConfig<TFieldValues>[];
    onSubmit: (values: TFieldValues) => void;
    className?: string;
    children?: React.ReactNode;
}

// --- Component ---

export function DynamicForm<TFieldValues extends FieldValues>({
    form,
    fields,
    onSubmit,
    className,
    children,
}: DynamicFormProps<TFieldValues>) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn("grid grid-cols-12 gap-6", className)}>
                {fields.map((fieldConfig) => {

                    const style = { gridColumn: `span ${fieldConfig.cols ?? 12} / span ${fieldConfig.cols ?? 12}` };

                    return (
                        <div key={fieldConfig.name} style={style} className={cn(fieldConfig.className)}>
                            <FormField
                                control={form.control}
                                name={fieldConfig.name}
                                render={({ field }) => (
                                    <FormItem className="-my-1.5">
                                        {/* Label (Skip for checkbox/switch which wraps it, but consistent label is nice) */}
                                        {fieldConfig.type !== "checkbox" && fieldConfig.type !== "switch" && fieldConfig.label && (
                                            <FormLabel>{fieldConfig.label}</FormLabel>
                                        )}

                                        <FormControl>
                                            <FormRenderer field={field} fieldConfig={fieldConfig} form={form} />
                                        </FormControl>

                                        {fieldConfig.description && (
                                            <FormDescription>{fieldConfig.description}</FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    );
                })}

                {/* Actions Area - Full Width */}
                <div className="col-span-12 flex justify-end items-center gap-2 mt-4">
                    {children}
                </div>
            </form>
        </Form>
    );
}

// --- Internal Renderer ---

function FormRenderer<TFieldValues extends FieldValues>({
    field,
    fieldConfig,
    form,
}: {
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
    fieldConfig: FieldConfig<TFieldValues>;
    form: UseFormReturn<TFieldValues>;
}) {
    switch (fieldConfig.type) {
        case "text":
        case "email":
        case "password":
            return (
                <Input
                    placeholder={fieldConfig.placeholder}
                    type={fieldConfig.type}
                    disabled={fieldConfig.disabled}
                    {...field}
                />
            );
        case "number":
            return (
                <Input
                    placeholder={fieldConfig.placeholder}
                    type="number"
                    disabled={fieldConfig.disabled}
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                />
            );
        case "textarea":
            return (
                <Textarea
                    placeholder={fieldConfig.placeholder}
                    className="resize-none min-h-[100px]"
                    disabled={fieldConfig.disabled}
                    {...field}
                />
            );
        case "editor":
            return (
                <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={fieldConfig.placeholder}
                    disabled={fieldConfig.disabled}
                />
            );
        case "select":
            return (
                <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={fieldConfig.disabled}
                >
                    <SelectTrigger>
                        <SelectValue placeholder={fieldConfig.placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {fieldConfig.options?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        case "radio":
            return (
                <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                    disabled={fieldConfig.disabled}
                >
                    {fieldConfig.options?.map((opt) => (
                        <FormItem key={opt.value} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                                <RadioGroupItem value={opt.value} />
                            </FormControl>
                            <FormLabel className="font-normal">
                                {opt.label}
                            </FormLabel>
                        </FormItem>
                    ))}
                </RadioGroup>
            );
        case "multi-select":
            return (
                <MultiSelect
                    options={fieldConfig.options ?? []}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={fieldConfig.placeholder}
                    disabled={fieldConfig.disabled}
                />
            );
        case "async-select":
            return (
                <AsyncSelect
                    loadOptions={fieldConfig.loadOptions as any}
                    defaultOptions={fieldConfig.defaultOptions}
                    value={field.value}
                    onChange={field.onChange}
                    isMulti={fieldConfig.isMulti}
                    placeholder={fieldConfig.placeholder}
                    disabled={fieldConfig.disabled}
                />
            );
        case "checkbox":
            return (
                <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={fieldConfig.disabled}
                    />
                    <div className="space-y-1 leading-none">
                        {fieldConfig.label && <FormLabel>{fieldConfig.label}</FormLabel>}
                        {fieldConfig.description && (
                            <p className="text-sm text-muted-foreground">
                                {fieldConfig.description}
                            </p>
                        )}
                    </div>
                </div>
            );
        case "switch":
            return (
                <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                        {fieldConfig.label && <FormLabel className="text-base">{fieldConfig.label}</FormLabel>}
                        {fieldConfig.description && (
                            <div className="text-sm text-muted-foreground">
                                {fieldConfig.description}
                            </div>
                        )}
                    </div>
                    <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={fieldConfig.disabled}
                    />
                </div>
            );
        case "date":
            return (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            disabled={fieldConfig.disabled}
                        >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>{fieldConfig.placeholder ?? "Pick a date"}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                                date < new Date("1900-01-01")
                            }
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            );
        case "date-range":
            return (
                <DatePickerWithRange
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={fieldConfig.placeholder}
                    disabled={fieldConfig.disabled}
                />
            );
        case "time":
            return (
                <TimePicker
                    value={field.value}
                    onChange={field.onChange}
                    disabled={fieldConfig.disabled}
                />
            );
        case "color":
            return (
                <div className="flex items-center gap-2">
                    <div
                        className="size-9 rounded-md border shadow-sm shrink-0 overflow-hidden relative group"
                        style={{ backgroundColor: field.value || "#000000" }}
                    >
                        <input
                            type="color"
                            {...field}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="size-4 bg-white/20 backdrop-blur-sm rounded-full border border-white/40" />
                        </div>
                    </div>
                    <Input
                        value={field.value || "#000000"}
                        onChange={(e) => field.onChange(e.target.value)}
                        placeholder="#000000"
                        className="font-mono uppercase"
                        maxLength={7}
                    />
                </div>
            );
        case "custom":
            if (fieldConfig.render) {
                return fieldConfig.render({ field, form });
            }
            return null;
        default:
            return <Input {...field} />;
    }
}
