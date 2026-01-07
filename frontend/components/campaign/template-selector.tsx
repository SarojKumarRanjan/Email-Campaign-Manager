"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
    Search, 
    Plus, 
    Check, 
    FileText,
    Star 
} from "lucide-react";  
import { useFetch } from "@/hooks/useApiCalls";
import { getAxiosForUseFetch } from "@/lib/axios";
import API_PATH from "@/lib/apiPath";
import { Template, TemplateListResponse } from "@/types/template";
import { cn } from "@/lib/utils";
import { Small, MutedText } from "@/components/common/typography";
import { TruncatedTooltip } from "@/components/common/truncated-tooltip";
import { TemplateEditorModal } from "@/components/template/template-editor-modal";

interface TemplateSelectorProps {
    selectedTemplateId: number | null;
    onSelect: (templateId: number | null, template?: Template) => void;
    className?: string;
}

export function TemplateSelector({
    selectedTemplateId,
    onSelect,
    className,
}: TemplateSelectorProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { data, isLoading, refetch } = useFetch<TemplateListResponse>(
        getAxiosForUseFetch,
        ["templates-selector", searchQuery],
        {
            url: { template: API_PATH.TEMPLATES.LIST_TEMPLATES },
            params: {
                page: 1,
                limit: 50,
                search: searchQuery || undefined,
            },
        }
    );

    const templates = data?.data || [];

    const handleCreateNew = () => {
        setShowCreateModal(true);
    };

    const handleTemplateCreated = (template: Template) => {
        refetch();
        onSelect(template.id, template);
    };

    const handleSelect = (template: Template) => {
        if (selectedTemplateId === template.id) {
            onSelect(null);
        } else {
            onSelect(template.id, template);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Search and Create */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={handleCreateNew} variant="outline" className="gap-2">
                    <Plus className="size-4" />
                    Create New
                </Button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 max-h-[400px] overflow-y-auto p-1">
                {isLoading ? (
                    <>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="border">
                                <CardContent className="p-4">
                                    <Skeleton className="h-24 w-full mb-3" />
                                    <Skeleton className="h-4 w-3/4" />
                                </CardContent>
                            </Card>
                        ))}
                    </>
                ) : templates.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <FileText className="size-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">
                            {searchQuery
                                ? "No templates match your search"
                                : "No templates yet. Create your first template!"}
                        </p>
                        <Button onClick={handleCreateNew} className="gap-2">
                            <Plus className="size-4" />
                            Create Template
                        </Button>
                    </div>
                ) : (
                    templates.map((template) => {
                        const isSelected = selectedTemplateId === template.id;
                        
                        return (
                            <Card
                                key={template.id}
                                className={cn(
                                    "cursor-pointer transition-all hover:shadow-md",
                                    isSelected && "ring-1 ring-primary border-primary"
                                )}
                                onClick={() => handleSelect(template)}
                            >
                                <CardContent className="p-4">
                                    {/* Preview Thumbnail */}
                                    <div className="aspect-video bg-muted/50 rounded-md border mb-3 flex items-center justify-center overflow-hidden relative">
                                        {template.thumbnail_url ? (
                                            <img
                                                src={template.thumbnail_url}
                                                alt={template.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FileText className="size-8 text-muted-foreground" />
                                        )}
                                        
                                        {/* Selection Indicator */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                                <Check className="size-3" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Template Info */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Small className="font-medium">
                                                <TruncatedTooltip value={template.name} limit={25} />
                                            </Small>
                                            {template.is_default && (
                                                <Badge variant="secondary" className="text-xs gap-1 py-0">
                                                    <Star className="size-2.5 fill-current" />
                                                    Default
                                                </Badge>
                                            )}
                                        </div>
                                        <MutedText className="text-xs">
                                            <TruncatedTooltip value={template.subject || "No subject"} limit={30} />
                                        </MutedText>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Selected Template Info */}
            {selectedTemplateId && templates.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <Check className="size-4 text-primary" />
                    <Small className="text-primary">
                        Template selected: {templates.find(t => t.id === selectedTemplateId)?.name}
                    </Small>
                </div>
            )}

            {/* Create Template Modal */}
            <TemplateEditorModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSave={handleTemplateCreated}
            />
        </div>
    );
}
