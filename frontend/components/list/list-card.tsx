import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Mail, Edit2, Trash2 } from 'lucide-react';

export interface TagCardProps {
  id?: number | string;
  title: string;
  description?: string;
  contactCount?: number;
  campaignCount?: number;
  color?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const TagCard = ({ 
  title = "VIP Customers",
  description = "High-value customers with premium subscriptions",
  contactCount = 0,
  campaignCount = 0,
  color = "#3B82F6",
  onEdit = () => {},
  onDelete = () => {}
}: TagCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditHovered, setIsEditHovered] = useState(false);
  const [isDeleteHovered, setIsDeleteHovered] = useState(false);

  const hexToRgba = (hex:string, opacity:number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const bgColor = hexToRgba(color, 0.1);
  const hoverBgColor = hexToRgba(color, 0.15);

  return (
    <Card 
      className="group relative w-full max-w-sm overflow-hidden border border-border/40 transition-all duration-300 cursor-pointer"
      style={{ 
        backgroundColor: isHovered ? hoverBgColor : bgColor,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 12px 24px -10px rgba(0,0,0,0.2)' : '0 2px 8px -4px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Accent bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
        style={{ 
          backgroundColor: color,
          transform: isHovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'left'
        }}
      />
      
      <CardHeader className="pb-4 pt-6">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2 flex-1">
            <span 
              className="transition-transform duration-300"
              style={{ transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }}
            >
              {title}
            </span>
          </CardTitle>
          
          {/* Action Buttons */}
          <div 
            className="flex items-center gap-1 transition-all duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              transform: isHovered ? 'translateX(0)' : 'translateX(10px)'
            }}
          >
            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              onMouseEnter={() => setIsEditHovered(true)}
              onMouseLeave={() => setIsEditHovered(false)}
              className="p-2 rounded-md transition-all duration-200 hover:bg-background/80"
              style={{
                transform: isEditHovered ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              <Edit2 
                className="h-4 w-4 transition-colors duration-200" 
                style={{ color: isEditHovered ? color : 'currentColor' }}
              />
            </button>
            
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              onMouseEnter={() => setIsDeleteHovered(true)}
              onMouseLeave={() => setIsDeleteHovered(false)}
              className="p-2 rounded-md transition-all duration-200 hover:bg-background/80"
              style={{
                transform: isDeleteHovered ? 'scale(1.1) rotate(10deg)' : 'scale(1) rotate(0deg)'
              }}
            >
              <Trash2 
                className="h-4 w-4 transition-colors duration-200" 
                style={{ color: isDeleteHovered ? '#EF4444' : 'currentColor' }}
              />
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 pb-6">
        <p className="text-sm text-muted-foreground leading-relaxed min-h-[2.5rem]">
          {description}
        </p>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* Contacts Stat */}
          <div 
            className="flex flex-col gap-2 p-3 rounded-lg bg-background/50 transition-all duration-300"
            style={{
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
              boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="p-1.5 rounded-md transition-all duration-300"
                style={{ 
                  backgroundColor: hexToRgba(color, isHovered ? 0.2 : 0.15),
                  transform: isHovered ? 'rotate(5deg)' : 'rotate(0deg)'
                }}
              >
                <Users className="h-5 w-5" style={{ color }} />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Contacts
              </span>
            </div>
            <span className="text-2xl font-bold text-foreground pl-1">
              {contactCount.toLocaleString()}
            </span>
          </div>
          
          {/* Campaigns Stat */}
          <div 
            className="flex flex-col gap-2 p-3 rounded-lg bg-background/50 transition-all duration-300"
            style={{
              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
              boxShadow: isHovered ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              transitionDelay: '50ms'
            }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="p-1.5 rounded-md transition-all duration-300"
                style={{ 
                  backgroundColor: hexToRgba(color, isHovered ? 0.2 : 0.15),
                  transform: isHovered ? 'rotate(-5deg)' : 'rotate(0deg)'
                }}
              >
                <Mail className="h-5 w-5" style={{ color }} />
              </div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Campaigns
              </span>
            </div>
            <span className="text-2xl font-bold text-foreground pl-1">
              {campaignCount}
            </span>
          </div>
        </div>
      </CardContent>
      
      {/* Corner Decoration */}
      <div 
        className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-20 transition-all duration-500"
        style={{ 
          backgroundColor: color,
          transform: isHovered ? 'scale(1.5)' : 'scale(1)'
        }}
      />
    </Card>
  );
};

