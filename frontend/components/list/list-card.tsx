import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Mail, UserRoundPen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TruncatedTooltip } from '../common/truncated-tooltip';
import { cn } from '@/lib/utils';

export interface TagCardProps {
  id?: number | string;
  title: string;
  description?: string;
  contactCount?: number;
  campaignCount?: number;
  color?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewContacts?: () => void;
  onViewCampaigns?: () => void;
}

export const TagCard = ({
  title = "VIP Customers",
  description = "High-value customers with premium subscriptions",
  contactCount = 0,
  campaignCount = 0,
  color = "#3B82F6",
  onEdit = () => {},
  onDelete = () => {},
  onViewContacts,
  onViewCampaigns
}: TagCardProps) => {
  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <Card
      className="relative w-full h-full max-w-sm overflow-hidden border border-border/40"
      style={{
        backgroundColor: hexToRgba(color, 0.15),
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 24px -10px rgba(0,0,0,0.2)'
      }}
    >
      <CardContent className="space-y-2">
        {/* Title + Actions */}
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-xl font-semibold text-foreground"
            style={{ transform: 'translateX(4px)' }}
          >
            {title}
          </h3>

          <div className="flex items-center gap-1">
            <Button variant="ghost" onClick={onEdit}>
              <UserRoundPen
                className="size-5"
                style={{ color }}
              />
            </Button>

            <Button variant="ghost" onClick={onDelete}>
              <Trash2
                className="size-5"
                style={{ color: '#EF4444' }}
              />
            </Button>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed ">
          {<TruncatedTooltip value={description} limit={30} />}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div
            className={cn(
              "flex flex-col gap-2 p-3 rounded-lg bg-background/50 transition-colors",
              onViewContacts && "cursor-pointer hover:bg-background/80 active:scale-95"
            )}
            style={{
              transform: 'scale(1.02)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onViewContacts?.();
            }}
          >
            <div className="flex items-center justify-between">
              <div
                className="p-1.5 rounded-md"
                style={{ backgroundColor: hexToRgba(color, 0.2) }}
              >
                <Users className="h-5 w-5" style={{ color }} />
              </div>
              
            <span className="text-2xl font-bold text-foreground">
              {contactCount.toLocaleString()}
            </span>
            
            </div>
                <span className="text-xs font-medium text-muted-foreground uppercase">
                Contacts
              </span>
          </div>

          <div
            className={cn(
              "flex flex-col gap-2 p-3 rounded-lg bg-background/50 transition-colors",
              onViewCampaigns && "cursor-pointer hover:bg-background/80 active:scale-95"
            )}
            style={{
              transform: 'scale(1.02)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onViewCampaigns?.();
            }}
          >
            <div className="flex items-center justify-between">
              <div
                className="p-1.5 rounded-md"
                style={{ backgroundColor: hexToRgba(color, 0.2) }}
              >
                <Mail className="h-5 w-5" style={{ color }} />
              </div>
               <span className="text-2xl font-bold text-foreground">
              {campaignCount}
            </span>
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase">
                Campaigns
              </span>
          </div>
        </div>
      </CardContent>

      {/* Decorative blob (always expanded) */}
      <div
        className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-20"
        style={{
          backgroundColor: color,
          transform: 'scale(1.5)'
        }}
      />
    </Card>
  );
};
