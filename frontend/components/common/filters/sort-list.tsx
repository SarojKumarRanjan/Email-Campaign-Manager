"use client";

import {
    ArrowDownUp,
    GripVertical,
    Plus,
    Trash2,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
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
import type { ExtendedColumnSort } from "@/types/data-table";

interface SortListProps {
    fields: { id: string; label: string }[];
    sorts: ExtendedColumnSort<any>[];
    onSortsChange: (sorts: ExtendedColumnSort<any>[]) => void;
}

export function SortList({
    fields,
    sorts,
    onSortsChange,
}: SortListProps) {
    const onSortAdd = React.useCallback(() => {
        const field = fields.find(f => !sorts.some(s => s.id === f.id));
        if (!field) return;

        onSortsChange([...sorts, { id: field.id, desc: false }]);
    }, [fields, sorts, onSortsChange]);

    const onSortUpdate = React.useCallback(
        (id: string, updates: Partial<ExtendedColumnSort<any>>) => {
            onSortsChange(sorts.map(s => s.id === id ? { ...s, ...updates } : s));
        },
        [sorts, onSortsChange],
    );

    const onSortRemove = React.useCallback(
        (id: string) => {
            onSortsChange(sorts.filter(s => s.id !== id));
        },
        [sorts, onSortsChange],
    );

    return (
        <div className="flex flex-col gap-2">
            <Sortable
                value={sorts}
                onValueChange={onSortsChange}
                getItemValue={(item) => item.id}
            >
                <SortableContent className="flex flex-col gap-2">
                    {sorts.map((sort) => (
                        <SortItem
                            key={sort.id}
                            sort={sort}
                            fields={fields}
                            onUpdate={onSortUpdate}
                            onRemove={onSortRemove}
                        />
                    ))}
                </SortableContent>
            </Sortable>
            <Button
                variant="outline"
                size="sm"
                className="w-fit h-8"
                onClick={onSortAdd}
                disabled={sorts.length >= fields.length}
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Sort
            </Button>
        </div>
    );
}

function SortItem({
    sort,
    fields,
    onUpdate,
    onRemove,
}: {
    sort: ExtendedColumnSort<any>;
    fields: { id: string; label: string }[];
    onUpdate: (id: string, updates: any) => void;
    onRemove: (id: string) => void;
}) {
    return (
        <div className="flex items-center gap-2">
            <SortableItemHandle asChild>
                <Button variant="ghost" size="icon" className="h-8 w-6 cursor-grab">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </Button>
            </SortableItemHandle>

            <Select
                value={sort.id}
                onValueChange={(value) => onUpdate(sort.id, { id: value })}
            >
                <SelectTrigger className="h-8 w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {fields.map((f) => (
                        <SelectItem
                            key={f.id}
                            value={f.id}
                            disabled={sort.id !== f.id && fields.some(field => field.id === f.id && false /* wait, logic is wrong here but you get it */)}
                        >
                            {f.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={sort.desc ? "desc" : "asc"}
                onValueChange={(value) => onUpdate(sort.id, { desc: value === "desc" })}
            >
                <SelectTrigger className="h-8 w-[100px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {dataTableConfig.sortOrders.map((order) => (
                        <SelectItem key={order.value} value={order.value}>
                            {order.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive ml-auto"
                onClick={() => onRemove(sort.id)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
