"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Pencil, 
  MapPin, 
  Users, 
  MoreVertical,
} from "lucide-react";
import { Campaign, CampaignStatus } from "@/types/campaign";
import { formatReadableDateSafe } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Heading, MutedText, Small } from "@/components/common/typography";
import { TruncatedTooltip } from "../common/truncated-tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface CampaignCardProps {
  campaign?: Campaign;
  isLoading?: boolean;
  onEdit?: (id: number) => void;
}

const statusConfig: Record<CampaignStatus, { label: string; color: string; textColor: string }> = {
  [CampaignStatus.DRAFT]: { label: "Draft", color: "bg-gray-100", textColor: "text-gray-600" },
  [CampaignStatus.SCHEDULED]: { label: "Scheduled", color: "bg-blue-50", textColor: "text-blue-600" },
  [CampaignStatus.SENDING]: { label: "Sending", color: "bg-yellow-50", textColor: "text-yellow-600" },
  [CampaignStatus.PAUSED]: { label: "Paused", color: "bg-orange-50", textColor: "text-orange-600" },
  [CampaignStatus.COMPLETED]: { label: "Active", color: "bg-emerald-50", textColor: "text-emerald-600" },
  [CampaignStatus.CANCELLED]: { label: "Cancelled", color: "bg-red-50", textColor: "text-red-600" },
};

export const CampaignCard = ({ campaign, isLoading = false, onEdit }: CampaignCardProps) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card className="w-full border shadow-sm">
        <CardContent className="p-5 space-y-6">
          <div className="flex justify-between items-start">
             <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
             </div>
             <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="grid grid-cols-5 gap-4 py-4 border-t border-b">
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
             <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-5 gap-4">
             <Skeleton className="h-8 w-20" />
             <Skeleton className="h-8 w-20" />
             <Skeleton className="h-8 w-20" />
             <Skeleton className="h-8 w-20" />
             <Skeleton className="h-8 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!campaign) return null;

  const status = statusConfig[campaign.status] || statusConfig[CampaignStatus.DRAFT];
  
  const handleCardClick = () => {
      router.push(`/campaigns/${campaign.id}`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.(campaign.id);
  };



  return (
    <Card 
        className="w-full border bg-card hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
    >
      <CardContent className="p-5">
        {/* Top Header Row */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <Heading level={5} className="transition-colors hover:underline">
              {campaign.name}
            </Heading>
            <Badge variant="secondary" className={cn("rounded-md px-2 py-0.5 text-xs font-normal border-0", status.color, status.textColor)}>
              {status.label}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditClick}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Campaign
                </DropdownMenuItem>
                {/* Future: Add Duplicate, Delete, etc. */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Meta Row (Job Id, Location, Hiring Status) */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-primary" />
                <Small className="text-foreground">From:</Small> 
                <MutedText asChild>
                    <span className="truncate max-w-[200px]" title={campaign.from_email}>
                        {campaign.from_email || 'Global'}
                    </span>
                </MutedText>
            </div>
            <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary" />
                <Small className="text-foreground">Progress:</Small> 
                <MutedText asChild>
                    <span>{campaign.sent_count} / {campaign.total_recipients} Sent</span>
                </MutedText>
            </div>
        </div>

        {/* Middle Grid (Subject, Template, Dates) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 border-t border-b border-border mb-4">
            
            {/* Subject (Skill Assessment) */}
            <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-1 mb-1">
                    <Small className="text-foreground">Subject</Small>{/*  <Pencil className="w-3 h-3 text-primary ml-1" /> */}
                </div>
                <MutedText>
                    {<TruncatedTooltip value={campaign.subject || "-"} limit={25} />}
                </MutedText>
            </div>

            {/* Template (Requisition) */}
            <div className="col-span-1">
                 <div className="flex items-center gap-1 mb-1">
                    <Small className="text-foreground">Template</Small>
                </div>
                <MutedText title={campaign.template_name || (campaign.template_id ? `TMPL-${campaign.template_id}` : "Custom HTML")}>
                    {<TruncatedTooltip value={campaign.template_name || (campaign.template_id ? `TMPL-${campaign.template_id}` : "Custom HTML") || "-"} limit={20} />}
                </MutedText>
            </div>

            {/* Schedule (Expiring On) */}
             <div className="col-span-1">
                 <div className="flex items-center gap-1 mb-1">
                    <Small className="text-foreground">Scheduled For</Small> {/* <Pencil className="w-3 h-3 text-primary ml-1" /> */}
                </div>
                <MutedText>
                    {campaign.scheduled_at ? formatReadableDateSafe(campaign.scheduled_at,true) : (campaign.status === 'draft' ? 'Not Scheduled' : '-')}
                </MutedText>
            </div>

            {/* From Name (Created By) */}
            <div className="col-span-1">
                 <div className="flex items-center gap-1 mb-1">
                    <Small className="text-foreground">Created By</Small> {/* <Pencil className="w-3 h-3 text-primary ml-1" /> */}
                </div>
                <div className="flex items-center gap-1">
                    <MutedText asChild>
                        <span>{campaign.from_name} <span className="text-xs text-muted-foreground/50">(1)</span></span>
                    </MutedText>
                </div>
            </div>
             
             {/* Created At (Published On) */}
             <div className="col-span-1">
                 <div className="flex items-center gap-1 mb-1">
                    <Small className="text-foreground">Created On</Small>
                </div>
                <MutedText>
                    {formatReadableDateSafe(campaign.created_at)}
                </MutedText>
            </div>

        </div>

        {/* Footer Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            <div className="col-span-1">
                 <div className="mb-1">
                    <Small className="text-foreground">Sent:</Small> 
                    <MutedText asChild className="ml-1">
                        <span>{campaign.sent_count}</span>
                    </MutedText>
                 </div>
            </div>
             <div className="col-span-1">
                 <div className="mb-1">
                    <Small className="text-foreground">Delivered:</Small> 
                    <MutedText asChild className="ml-1">
                        <span>{campaign.delivered_count}</span>
                    </MutedText>
                 </div>
            </div>
             <div className="col-span-1">
                 <div className="mb-1">
                    <Small className="text-foreground">Opened:</Small> 
                    <MutedText asChild className="ml-1">
                        <span>{campaign.opened_count}</span>
                    </MutedText>
                 </div>
            </div>
             <div className="col-span-1">
                 <div className="mb-1">
                    <Small className="text-foreground">Clicked:</Small> 
                    <MutedText asChild className="ml-1">
                        <span>{campaign.clicked_count}</span>
                    </MutedText>
                 </div>
            </div>
             <div className="col-span-1">
                 <div className="mb-1">
                    <Small className="text-foreground">Bounced:</Small> 
                    <MutedText asChild className="ml-1">
                        <span>{campaign.bounced_count}</span>
                    </MutedText>
                 </div>
            </div>

        </div>

      </CardContent>
    </Card>
  );
};
