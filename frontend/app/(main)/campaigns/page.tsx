"use client";

import React, { useState } from "react";
import PageHeader from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List as ListIcon, Plus } from "lucide-react";
import { CampaignGrid } from "@/components/campaign/campaign-grid";
import CampaignList from "@/components/campaign/campaign-list";
import { useRouter } from "next/navigation";

export default function CampaignsPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const router = useRouter();

    return (
        <div className="flex flex-1 flex-col gap-8 p-8 max-w-[1600px] mx-auto w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Campaigns"
                    description="Manage and track your email marketing campaigns"
                />
                
                <div className="flex items-center gap-3">
                     <div className="flex items-center p-1 bg-muted rounded-lg border border-border/50">
                        <Button
                            variant={viewMode === "grid" ? "secondary" : "ghost"}
                            size="sm"
                            className="h-8 px-2.5"
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="sm"
                             className="h-8 px-2.5"
                            onClick={() => setViewMode("list")}
                        >
                            <ListIcon className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button onClick={() => router.push("/campaigns/new")} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Campaign
                    </Button>
                </div>
            </div>

            <div className="w-full">
                {viewMode === "grid" ? <CampaignGrid /> : <CampaignList />}
            </div>
        </div>
    );
}
