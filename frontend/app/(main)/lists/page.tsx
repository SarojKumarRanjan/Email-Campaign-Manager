"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { DynamicForm, type FieldConfig } from "@/components/common/form/dynamic-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type Option } from "@/components/common/form/multi-select";

// --- Schema ---

const listSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(), // Using Editor now
    type: z.string().min(1, "Please select a list type"),

    // Advanced Fields
    category: z.string().min(1, "Category is required (Radio)"),
    tags: z.array(z.string()).min(1, "Select at least one tag (Multi)"),
    owner: z.string().min(1, "Owner is required (Async)"),

    schedule: z.object({
        range: z.object({
            from: z.date(),
            to: z.date().optional()
        }).optional(),
        time: z.string().optional(),
    }),

    priority: z.number().min(1, "Priority must be at least 1"),
    is_active: z.boolean(),
    settings: z.object({
        notifications: z.boolean(),
    }),
});

type ListFormValues = z.infer<typeof listSchema>;

// --- Demo Page ---

export default function ListsPage() {

    // 1. Setup Form
    const form = useForm({
        resolver: zodResolver(listSchema),
        defaultValues: {
            name: "My Awesome Campaign List",
            type: "static",
            category: "marketing",
            tags: ["vip", "customers"],
            priority: 1,
            is_active: true,
            settings: {
                notifications: false
            },
            schedule: {
                time: "09:00"
            }
        }
    });

    // 2. Mock Async Fetcher
    const fetchUsers = async (query: string): Promise<Option[]> => {
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return [
            { label: "Admin User", value: "admin-1" },
            { label: "Jane Doe", value: "jane-2" },
            { label: "John Smith", value: "john-3" },
        ].filter(u => u.label.toLowerCase().includes(query.toLowerCase()));
    };

    // 3. Define Fields with Grid Layout (cols)
    const fields: FieldConfig<ListFormValues>[] = [
        // Row 1
        {
            name: "name",
            label: "List Name",
            type: "text",
            placeholder: "e.g. VIP Customers",
            cols: 6
        },
        {
            name: "type",
            label: "List Type",
            type: "select",
            placeholder: "Select a type",
            options: [
                { label: "Static List", value: "static" },
                { label: "Dynamic Segment", value: "dynamic" },
                { label: "Suppression List", value: "suppression" },
            ],
            cols: 6
        },

        // Row 2: Rich Text Editor
        {
            name: "description",
            label: "Description & Notes",
            type: "editor",
            placeholder: "Internal notes...",
            cols: 12
        },

        // Row 3: Advanced Selects
        {
            name: "tags",
            label: "Tags (Multi-Select)",
            type: "multi-select",
            placeholder: "Select tags...",
            options: [
                { label: "VIP", value: "vip" },
                { label: "Customers", value: "customers" },
                { label: "Leads", value: "leads" },
                { label: "Archived", value: "archived" },
            ],
            cols: 6
        },
        {
            name: "owner",
            label: "List Owner (Async Search)",
            type: "async-select",
            placeholder: "Search user...",
            loadOptions: fetchUsers,
            defaultOptions: [{ label: "Admin User", value: "admin-1" }],
            cols: 6
        },

        // Row 4: Radio & Date
        {
            name: "category",
            label: "Category",
            type: "radio",
            options: [
                { label: "Marketing", value: "marketing" },
                { label: "Transactional", value: "transactional" },
                { label: "Operational", value: "operational" },
            ],
            cols: 4
        },
        {
            name: "schedule.range",
            label: "Campaign Duration",
            type: "date-range",
            cols: 4
        },
        {
            name: "schedule.time",
            label: "Send Time",
            type: "time",
            cols: 4
        },

        // Row 5: Switches (Full Width helpers)
        {
            name: "settings.notifications",
            label: "Enable Notifications",
            type: "switch",
            description: "Receive email alerts when new contacts join.",
            cols: 6
        },
        {
            name: "is_active",
            label: "Active Status",
            type: "checkbox",
            description: "Unheck to archive this list.",
            cols: 6
        },

        // Row 6: Priority
        {
            name: "priority",
            label: "Priority Level",
            type: "number",
            cols: 12
        }
    ];

    // 4. Submit Handler
    const onSubmit = (data: ListFormValues) => {
        console.log("Form Submitted:", data);
        toast.success("List created successfully!", {
            description: <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4 code text-white text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
        });
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Lists & Segments</h2>
                    <p className="text-muted-foreground">
                        Advanced Dynamic Form Demo with Grid Layout & Rich Inputs.
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-12 max-w-6xl">
                <div className="col-span-12 md:col-span-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create New List</CardTitle>
                            <CardDescription>Use this form to define your new contact segment.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DynamicForm
                                form={form}
                                fields={fields}
                                onSubmit={onSubmit}
                            >
                                <Button type="submit" className="w-full">Create List</Button>
                            </DynamicForm>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-12 md:col-span-4">
                    <Card className="bg-muted/10 border-dashed sticky top-4">
                        <CardHeader>
                            <CardTitle>Live State</CardTitle>
                            <CardDescription>Real-time observation</CardDescription>
                        </CardHeader>
                        <CardContent className="font-mono text-xs overflow-auto max-h-[80vh]">
                            <div className="mb-4">
                                <h4 className="font-bold mb-1 text-destructive">Errors:</h4>
                                <pre className="whitespace-pre-wrap">{JSON.stringify(form.formState.errors, null, 2)}</pre>
                            </div>
                            <div>
                                <h4 className="font-bold mb-1">Values:</h4>
                                <pre className="text-muted-foreground whitespace-pre-wrap">{JSON.stringify(form.watch(), null, 2)}</pre>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
