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
  CalendarDays,
  UserCircle,
  MoreVerticalIcon
} from "lucide-react";
import { Campaign, CampaignStatus } from "@/types/campaign";
import { formatReadableDateSafe } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface CampaignCardProps {
  campaign?: Campaign;
  isLoading?: boolean;
}

const statusConfig: Record<CampaignStatus, { label: string; color: string; textColor: string }> = {
  [CampaignStatus.DRAFT]: { label: "Draft", color: "bg-gray-100", textColor: "text-gray-600" },
  [CampaignStatus.SCHEDULED]: { label: "Scheduled", color: "bg-blue-50", textColor: "text-blue-600" },
  [CampaignStatus.SENDING]: { label: "Sending", color: "bg-yellow-50", textColor: "text-yellow-600" },
  [CampaignStatus.PAUSED]: { label: "Paused", color: "bg-orange-50", textColor: "text-orange-600" },
  [CampaignStatus.COMPLETED]: { label: "Active", color: "bg-emerald-50", textColor: "text-emerald-600" }, // Using "Active" style for completed to match image vibe
  [CampaignStatus.CANCELLED]: { label: "Cancelled", color: "bg-red-50", textColor: "text-red-600" },
};

export const CampaignCard = ({ campaign, isLoading = false }: CampaignCardProps) => {
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

  const getInitials = (name: string) => {
      return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <Card 
        className="w-full border shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-card group"
        onClick={handleCardClick}
    >
      <CardContent className="p-5">
        {/* Top Header Row */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {campaign.name}
            </h3>
            <Badge variant="secondary" className={cn("rounded-md px-2 py-0.5 text-xs font-normal border-0", status.color, status.textColor)}>
              {status.label}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
             <Avatar className="h-8 w-8 bg-blue-600 text-white">
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {getInitials(campaign.from_name || "User")}
                </AvatarFallback>
             </Avatar>
             <button className="text-muted-foreground hover:text-foreground">
                <MoreVerticalIcon className="h-4 w-4" />
             </button>
          </div>
        </div>

        {/* Meta Row (Job Id, Location, Hiring Status) */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-1">
                <UserCircle className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Campaign Id:</span> 
                <span>CAMP-{campaign.id}</span>
            </div>
            <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">From:</span> 
                <span className="truncate max-w-[200px]" title={campaign.from_email}>
                    {campaign.from_email.split('@')[1] || 'Global'}
                </span>
            </div>
            <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">Progress:</span> 
                <span>{campaign.sent_count} / {campaign.total_recipients} Sent</span>
            </div>
        </div>

        {/* Middle Grid (Subject, Template, Dates) */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 border-t border-b border-border mb-4">
            
            {/* Subject (Skill Assessment) */}
            <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-1 mb-1 text-xs font-semibold text-foreground">
                    Subject <Pencil className="w-3 h-3 text-primary ml-1" />
                </div>
                <div className="text-sm text-muted-foreground truncate" title={campaign.subject}>
                    {campaign.subject || "-"}
                </div>
            </div>

            {/* Template (Requisition) */}
            <div className="col-span-1">
                 <div className="flex items-center gap-1 mb-1 text-xs font-semibold text-foreground">
                    Template
                </div>
                <div className="text-sm text-muted-foreground truncate">
                    {campaign.template_name || (campaign.template_id ? `TMPL-${campaign.template_id}` : "Custom HTML")}
                </div>
            </div>

            {/* Schedule (Expiring On) */}
             <div className="col-span-1">
                 <div className="flex items-center gap-1 mb-1 text-xs font-semibold text-foreground">
                    Scheduled For <Pencil className="w-3 h-3 text-primary ml-1" />
                </div>
                <div className="text-sm text-muted-foreground">
                    {campaign.scheduled_at ? formatReadableDateSafe(campaign.scheduled_at) : (campaign.status === 'draft' ? 'Not Scheduled' : '-')}
                </div>
            </div>

            {/* From Name (Created By) */}
            <div className="col-span-1">
                 <div className="flex items-center gap-1 mb-1 text-xs font-semibold text-foreground">
                    Created By <Pencil className="w-3 h-3 text-primary ml-1" />
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                     {campaign.from_name} <span className="text-xs text-muted-foreground/50">(1)</span>
                </div>
            </div>
             
             {/* Created At (Published On) */}
             <div className="col-span-1">
                 <div className="flex items-center gap-1 mb-1 text-xs font-semibold text-foreground">
                    Created On
                </div>
                <div className="text-sm text-muted-foreground">
                    {formatReadableDateSafe(campaign.created_at)}
                </div>
            </div>

        </div>

        {/* Footer Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            <div className="col-span-1">
                 <div className="text-xs font-semibold text-foreground mb-1">
                    Sent: <span className="text-muted-foreground font-normal ml-1">{campaign.sent_count}</span>
                 </div>
            </div>
             <div className="col-span-1">
                 <div className="text-xs font-semibold text-foreground mb-1">
                    Delivered: <span className="text-muted-foreground font-normal ml-1">{campaign.delivered_count}</span>
                 </div>
            </div>
             <div className="col-span-1">
                 <div className="text-xs font-semibold text-foreground mb-1">
                    Opened: <span className="text-muted-foreground font-normal ml-1">{campaign.opened_count}</span>
                 </div>
            </div>
             <div className="col-span-1">
                 <div className="text-xs font-semibold text-foreground mb-1">
                    Clicked: <span className="text-muted-foreground font-normal ml-1">{campaign.clicked_count}</span>
                 </div>
            </div>
             <div className="col-span-1">
                 <div className="text-xs font-semibold text-foreground mb-1">
                    Bounced: <span className="text-muted-foreground font-normal ml-1">{campaign.bounced_count}</span>
                 </div>
            </div>

        </div>

      </CardContent>
    </Card>
  );
};
