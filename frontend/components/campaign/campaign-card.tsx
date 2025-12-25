"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, 
  Users, 
  Mail, 
  BarChart3, 
  MoreHorizontal, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  PauseCircle,
  XCircle,
  FileEdit
} from "lucide-react";
import { Campaign, CampaignStatus } from "@/types/campaign";
import { formatReadableDateSafe } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CampaignCardProps {
  campaign?: Campaign;
  isLoading?: boolean;
}

const statusConfig: Record<CampaignStatus, { label: string; color: string; icon: any }> = {
  [CampaignStatus.DRAFT]: { label: "Draft", color: "bg-gray-500/15 text-gray-500 border-gray-500/20", icon: FileEdit },
  [CampaignStatus.SCHEDULED]: { label: "Scheduled", color: "bg-blue-500/15 text-blue-500 border-blue-500/20", icon: Clock },
  [CampaignStatus.SENDING]: { label: "Sending", color: "bg-yellow-500/15 text-yellow-500 border-yellow-500/20", icon: Mail },
  [CampaignStatus.PAUSED]: { label: "Paused", color: "bg-orange-500/15 text-orange-500 border-orange-500/20", icon: PauseCircle },
  [CampaignStatus.COMPLETED]: { label: "Completed", color: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
  [CampaignStatus.CANCELLED]: { label: "Cancelled", color: "bg-red-500/15 text-red-500 border-red-500/20", icon: XCircle },
};

export const CampaignCard = ({ campaign, isLoading = false }: CampaignCardProps) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card className="w-full overflow-hidden border border-border/40 bg-card/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-3/4 max-w-[400px]" />
                <Skeleton className="h-4 w-1/2 max-w-[300px]" />
              </div>
            </div>
            
            <div className="flex items-center gap-8 border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-8 ">
               <div className="space-y-2">
                 <Skeleton className="h-4 w-20" />
                 <Skeleton className="h-8 w-16" />
               </div>
               <div className="space-y-2">
                 <Skeleton className="h-4 w-20" />
                 <Skeleton className="h-8 w-16" />
               </div>
               <div className="space-y-2">
                 <Skeleton className="h-4 w-20" />
                 <Skeleton className="h-8 w-16" />
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!campaign) return null;

  const status = statusConfig[campaign.status] || statusConfig[CampaignStatus.DRAFT];
  const StatusIcon = status.icon;

  const handleCardClick = () => {
      router.push(`/campaigns/${campaign.id}`);
  };

  return (
    <Card 
        className="w-full group relative overflow-hidden border border-border/40 hover:border-primary/20 transition-all duration-300 hover:shadow-lg cursor-pointer bg-card/50 hover:bg-card"
        onClick={handleCardClick}
    >
      {/* Decorative gradient blob */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
          
          {/* Main Info */}
          <div className="flex-1 space-y-3 relative z-10">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className={cn("flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border-0 font-medium", status.color)}>
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </Badge>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {campaign.status === CampaignStatus.SCHEDULED 
                  ? `Scheduled for ${formatReadableDateSafe(campaign.scheduled_at)}`
                  : `Created ${formatReadableDateSafe(campaign.created_at)}`
                }
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                {campaign.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {campaign.subject}
              </p>
            </div>
          </div>

          {/* Stats / Metrics */}
          <div className="flex items-center gap-2 md:gap-12 md:px-8 border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0">
            
            {/* Recipients */}
            <div className="flex flex-col gap-1 min-w-[80px]">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Recips
              </span>
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {campaign.total_recipients.toLocaleString()}
              </span>
            </div>

            {/* Delivered / Sent */}
             <div className="flex flex-col gap-1 min-w-[80px]">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Sent
              </span>
              <span className="text-2xl font-bold text-foreground tabular-nums">
                 {campaign.sent_count.toLocaleString()}
              </span>
            </div>

             {/* Open Rate (Calculated or from Stats) - Basic calc here */}
             <div className="flex flex-col gap-1 min-w-[80px]">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> Open %
              </span>
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {campaign.sent_count > 0 
                    ? Math.round((campaign.opened_count / campaign.sent_count) * 100)
                    : 0
                }%
              </span>
            </div>

          </div>

          {/* Action (Chevron or helper) */}
           <div className="hidden md:flex items-center justify-center pl-4 text-muted-foreground/50 group-hover:text-primary transition-colors">
              <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreHorizontal className="w-5 h-5" />
              </Button>
           </div>

        </div>
      </CardContent>
    </Card>
  );
};
