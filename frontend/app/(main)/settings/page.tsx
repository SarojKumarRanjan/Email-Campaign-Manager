"use client";

import { CustomFilter } from "@/components/common/custom-filter";
import { FilterField } from "@/components/common/filters/filter-list";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Activity,
    CheckCircle2,
    Clock,
    Mail,
    ShieldCheck,
    Tag,
    User,
    Zap
} from "lucide-react";

const DEMO_FIELDS: FilterField[] = [
    {
        id: "status",
        label: "Campaign Status",
        variant: "multiSelect",
        options: [
            { label: "Draft", value: "draft", icon: Clock },
            { label: "Sending", value: "sending", icon: Zap },
            { label: "Completed", value: "completed", icon: CheckCircle2 },
            { label: "Paused", value: "paused", icon: Activity },
        ]
    },
    {
        id: "type",
        label: "Contact Type",
        variant: "select",
        options: [
            { label: "Customer", value: "customer", icon: User },
            { label: "Lead", value: "lead", icon: Zap },
            { label: "Partner", value: "partner", icon: ShieldCheck },
        ]
    },
    {
        id: "tags",
        label: "Tags",
        variant: "multiSelect",
        options: [
            { label: "Newsletter", value: "newsletter", icon: Mail },
            { label: "Product Updates", value: "product_updates", icon: Tag },
            { label: "Promotions", value: "promotions", icon: Tag },
        ]
    },
    {
        id: "createdAt",
        label: "Created Date",
        variant: "dateRange",
    },
    {
        id: "lastActive",
        label: "Last Active",
        variant: "date",
    },
    {
        id: "score",
        label: "Engagement Score",
        variant: "range",
        range: [0, 100],
        unit: "%"
    },
    {
        id: "verified",
        label: "Verified",
        variant: "boolean",
    },
    {
        id: "subject",
        label: "Email Subject",
        variant: "text",
        placeholder: "Search subjects..."
    }
];

export default function SettingsPage() {
    return (
        <div className="flex flex-1 flex-col gap-6 p-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Component Demo</h1>
                <p className="text-muted-foreground">
                    Exploring the new Custom Filter component with all supported filter types.
                </p>
            </div>

            <Card className="border-none shadow-sm bg-muted/30">
                <CardHeader>
                    <CardTitle>Custom Filter Demo</CardTitle>
                    <CardDescription>
                        This instance demonstrates Simple & Advanced modes, URL persistence, and progressive disclosure (3 filters shown initially).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CustomFilter
                        fields={DEMO_FIELDS}
                        initialVisibleFilters={3}
                        filterKey="demo_filters"
                        sortKey="demo_sort"
                    />
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Simple Mode</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 text-sm text-muted-foreground">
                        The simple mode provides a quick toolbar of filters.
                        It uses individual popovers for each field, keeping common actions accessible.
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Advanced Mode</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 text-sm text-muted-foreground">
                        Switching to Advanced mode allows users to build complex queries with multiple operators
                        and recursive logic (And/Or grouping). Supports drag-and-drop reordering.
                    </CardContent>
                </Card>

                <Card className="flex flex-col">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Nuqs Sync</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 text-sm text-muted-foreground">
                        All state is managed via URL search params. Try refreshing the page or
                        sharing the URL—all your filters and sorting will be preserved.
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
