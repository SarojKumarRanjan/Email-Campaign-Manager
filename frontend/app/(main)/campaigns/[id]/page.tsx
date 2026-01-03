"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch } from "@/hooks/useApiCalls";
import { getAxiosForUseFetch } from "@/lib/axios";
import API_PATH from "@/lib/apiPath";
import { Campaign, CampaignStatus } from "@/types/campaign";
import { Response } from "@/types"; 
import PageHeader from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    Calendar, Users, Mail, CheckCircle2, AlertCircle, 
    PauseCircle, XCircle, Clock, FileEdit, ArrowLeft,
    BarChart3, MousePointerClick, Ban, Percent
} from "lucide-react";
import { formatReadableDateSafe } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { CampaignFormModal } from "@/components/campaign/campaign-form-modal";

const statusConfig: Record<CampaignStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  [CampaignStatus.DRAFT]: { label: "Draft", variant: "secondary", icon: FileEdit },
  [CampaignStatus.SCHEDULED]: { label: "Scheduled", variant: "outline", icon: Clock },
  [CampaignStatus.SENDING]: { label: "Sending", variant: "default", icon: Mail },
  [CampaignStatus.PAUSED]: { label: "Paused", variant: "secondary", icon: PauseCircle },
  [CampaignStatus.COMPLETED]: { label: "Completed", variant: "default", icon: CheckCircle2 },
  [CampaignStatus.CANCELLED]: { label: "Cancelled", variant: "destructive", icon: XCircle },
};

export default function CampaignDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [editModalOpen, setEditModalOpen] = useState(false);

    const { data: campaignResponse, isLoading, error, refetch } = useFetch<Campaign>(
        getAxiosForUseFetch,
        ["campaign", id],
        {
            url: { template: API_PATH.CAMPAIGNS.GET_CAMPAIGN, variables: [id] },
        }
    );

    const campaign = campaignResponse;

    if (isLoading) {
        return <CampaignDetailsSkeleton />;
    }

    if (error || !campaign) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-10 gap-4">
                <div className="text-red-500 text-lg">Failed to load campaign details</div>
                <Button variant="outline" onClick={() => router.push("/campaigns")}>
                    Back to Campaigns
                </Button>
            </div>
        );
    }

    const status = statusConfig[campaign.status] || statusConfig[CampaignStatus.DRAFT];
    const StatusIcon = status.icon;

    // Calculate generic rates (in case backend sends 0 or we want quick calc)
    const openRate = campaign.sent_count > 0 ? (campaign.opened_count / campaign.sent_count) * 100 : 0;
    const clickRate = campaign.sent_count > 0 ? (campaign.clicked_count / campaign.sent_count) * 100 : 0;
    const bounceRate = campaign.sent_count > 0 ? (campaign.bounced_count / campaign.sent_count) * 100 : 0;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4  mx-auto w-full">
            <div className="flex flex-col gap-1">
                <Button 
                    variant="ghost" 
                    className="w-fit p-0 h-auto gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => router.push("/campaigns")}
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Campaigns
                </Button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
                            <Badge variant={status.variant} className="flex items-center gap-1">
                                <StatusIcon className="w-3.5 h-3.5" />
                                {status.label}
                            </Badge>
                        </div>
                        <div className="flex flex-col gap-1 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">Subject:</span>
                                {campaign.subject}
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {campaign.status === CampaignStatus.SCHEDULED 
                                        ? `Scheduled: ${formatReadableDateSafe(campaign.scheduled_at,true)}`
                                        : `Created: ${formatReadableDateSafe(campaign.created_at)}`
                                    }
                                </div>
                                <span>•</span>
                                <div>From: {campaign.from_name} &lt;{campaign.from_email}&gt;</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setEditModalOpen(true)}>Edit</Button>
                        <Button variant="secondary">Send Test</Button>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{campaign.total_recipients.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sent</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{campaign.sent_count.toLocaleString()}</div>
                         <p className="text-xs text-muted-foreground">
                            {campaign.total_recipients > 0 
                                ? `${Math.round((campaign.sent_count / campaign.total_recipients)*100)}% of list` 
                                : "0% of list"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                         <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
                         <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{openRate.toFixed(1)}%</div>
                         <p className="text-xs text-muted-foreground">
                            {campaign.opened_count.toLocaleString()} opens
                         </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clickRate.toFixed(1)}%</div>
                         <p className="text-xs text-muted-foreground">
                            {campaign.clicked_count.toLocaleString()} clicks
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Metrics */}
            <div className="grid gap-8 md:grid-cols-2">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Delivery Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Delivered</span>
                             </div>
                             <span className="font-semibold">{campaign.delivered_count.toLocaleString()}</span>
                        </div>
                         <Separator />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                                <span>Failed</span>
                            </div>
                            <span className="font-semibold">{campaign.failed_count.toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Ban className="w-4 h-4 text-red-500" />
                                <span>Bounced</span>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold">{campaign.bounced_count.toLocaleString()}</div>
                                <div className="text-xs text-muted-foreground">{bounceRate.toFixed(1)}% bounce rate</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                 {/* Here we could add a preview or more stats */}
                 <Card className="h-full flex items-center justify-center bg-muted/20 border-dashed">
                    <div className="text-center p-6">
                        <p className="text-muted-foreground">Recipient Activity Chart / Timeline Placeholder</p>
                        <Button variant="link">View Detailed Reports</Button>
                    </div>
                </Card>
            </div>

            <CampaignFormModal 
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                campaignId={parseInt(id)}
                onSave={() => {
                    refetch();
                }}
            />
        </div>
    );
}

function CampaignDetailsSkeleton() {
    return (
        <div className="flex flex-1 flex-col gap-8 p-8 max-w-[1600px] mx-auto w-full">
            <div className="space-y-4">
                <Skeleton className="h-4 w-32" />
                <div className="flex justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </div>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                ))}
            </div>
             <div className="grid gap-4 md:grid-cols-2">
                 <Skeleton className="h-64 w-full" />
                 <Skeleton className="h-64 w-full" />
             </div>
        </div>
    )
}
