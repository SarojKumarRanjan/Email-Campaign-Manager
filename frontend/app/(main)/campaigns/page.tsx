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
        <div className="flex p-4 flex-1 flex-col mx-auto w-full">
            
                <PageHeader
                    title="Campaigns"
                    rightNode={
                    <div className="flex items-center gap-3">
                     
                        <Button
                            variant={viewMode === "grid" ? "default" : "outline"}
                            size="sm"
                            className="h-8 px-2.5"
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="size-5" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            size="sm"
                             className="h-8 px-2.5"
                            onClick={() => setViewMode("list")}
                        >
                            <ListIcon className="size-5" />
                        </Button>

                        <Button onClick={() => router.push("/campaigns/new")} className="gap-2">
                            <Plus className="size-5" />
                            Create Campaign
                        </Button>
                    </div>
                    }
                />
                

           

            <div className="w-full mt-4">
                {viewMode === "grid" ? <CampaignGrid /> : <CampaignList />}
            </div>
        </div>
    );
}
