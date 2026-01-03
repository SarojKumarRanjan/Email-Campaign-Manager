"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    FileText, 
    MoreVertical, 
    Pencil, 
    Copy, 
    Trash2, 
    Star,
    Calendar
} from "lucide-react";
import { Template } from "@/types/template";
import { formatReadableDateSafe } from "@/lib/utils";
import { Heading, MutedText, Small } from "@/components/common/typography";
import { TruncatedTooltip } from "@/components/common/truncated-tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TemplateCardProps {
    template?: Template;
    isLoading?: boolean;
    onEdit?: (id: number) => void;
    onDuplicate?: (id: number) => void;
    onDelete?: (id: number) => void;
    onSetDefault?: (id: number) => void;
}

export const TemplateCard = ({ 
    template, 
    isLoading = false, 
    onEdit,
    onDuplicate,
    onDelete,
    onSetDefault
}: TemplateCardProps) => {
    if (isLoading) {
        return (
            <Card className="w-full border shadow-sm">
                <CardContent className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                    </div>
                    <div className="aspect-video bg-muted rounded-md">
                        <Skeleton className="w-full h-full" />
                    </div>
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!template) return null;

    const handleCardClick = () => {
        onEdit?.(template.id);
    };

    return (
        <Card 
            className="w-full border bg-card hover:shadow-md transition-shadow cursor-pointer"
            onClick={handleCardClick}
        >
            <CardContent className="p-5">
                {/* Header Row */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <Heading level={5} className="transition-colors">
                            <TruncatedTooltip value={template.name} limit={30} />
                        </Heading>
                        {template.is_default && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                                <Star className="size-3 fill-current" />
                                Default
                            </Badge>
                        )}
                    </div>
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => onEdit?.(template.id)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDuplicate?.(template.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                            </DropdownMenuItem>
                            {!template.is_default && (
                                <DropdownMenuItem onClick={() => onSetDefault?.(template.id)}>
                                    <Star className="mr-2 h-4 w-4" />
                                    Set as Default
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onClick={() => onDelete?.(template.id)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Subject */}
                <div className="mb-4">
                    <div className="flex items-center gap-1 mb-1">
                        <Small className="text-foreground">Subject:</Small>
                    </div>
                    <MutedText>
                        <TruncatedTooltip value={template.subject || "No subject"} limit={50} />
                    </MutedText>
                </div>

                {/* Preview Thumbnail */}
                <div className="aspect-video bg-muted/50 rounded-md border border-border mb-4 flex items-center justify-center overflow-hidden">
                    {template.thumbnail_url ? (
                        <img 
                            src={template.thumbnail_url} 
                            alt={template.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <FileText className="size-8" />
                            <Small>No preview available</Small>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="size-3.5" />
                        <span>{formatReadableDateSafe(template.created_at)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
