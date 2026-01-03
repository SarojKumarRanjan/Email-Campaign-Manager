"use client";

import React, { useState } from "react";
import PageHeader from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List as ListIcon, Plus, FileText } from "lucide-react";
import { TemplateGrid } from "@/components/template/template-grid";
import { TemplateEditorModal } from "@/components/template/template-editor-modal";

export default function TemplatesPage() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

    const handleCreateTemplate = () => {
        setEditingTemplateId(null);
        setEditorOpen(true);
    };

    const handleEditTemplate = (templateId: number) => {
        setEditingTemplateId(templateId);
        setEditorOpen(true);
    };

    const handleEditorClose = () => {
        setEditorOpen(false);
        setEditingTemplateId(null);
    };

    return (
        <div className="flex p-4 flex-1 flex-col mx-auto w-full">
            <PageHeader
                title="Email Templates"
                rightNode={
                    <div className="flex items-center gap-3">
                        <Button
                            variant={viewMode === "grid" ? "default" : "outline"}
                            onClick={() => setViewMode("grid")}
                        >
                            <LayoutGrid className="size-5" />
                        </Button>
                        <Button
                            variant={viewMode === "list" ? "default" : "outline"}
                            onClick={() => setViewMode("list")}
                        >
                            <ListIcon className="size-5" />
                        </Button>
                        <Button onClick={handleCreateTemplate} className="gap-2">
                            <FileText className="size-5" />
                            Create Template
                        </Button>
                    </div>
                }
            />

            <div className="w-full mt-4">
                <TemplateGrid onEditTemplate={handleEditTemplate} />
            </div>

            <TemplateEditorModal
                open={editorOpen}
                onClose={handleEditorClose}
                templateId={editingTemplateId}
            />
        </div>
    );
}
