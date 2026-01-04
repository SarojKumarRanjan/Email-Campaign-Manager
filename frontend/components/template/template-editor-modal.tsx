"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FullscreenModal } from "@/components/common/fullscreen-modal";
import { MjmlEditor, defaultMjmlTemplate } from "./mjml-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Save, X, Loader2 } from "lucide-react";
import { useFetch, useConfigurableMutation } from "@/hooks/useApiCalls";
import { getAxiosForUseFetch, postAxiosForUseFetch, putAxiosForUseFetch } from "@/lib/axios";
import API_PATH from "@/lib/apiPath";
import { Template, CreateTemplateRequest, UpdateTemplateRequest } from "@/types/template";
import { cn } from "@/lib/utils";

const templateSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    subject: z.string().min(1, "Subject is required"),
    is_default: z.boolean().optional(),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface TemplateEditorModalProps {
    open: boolean;
    onClose: () => void;
    templateId?: number | null;
    onSave?: (template: Template) => void;
}

export function TemplateEditorModal({
    open,
    onClose,
    templateId,
    onSave,
}: TemplateEditorModalProps) {
    const isEditMode = !!templateId;
    const [mjmlContent, setMjmlContent] = useState(defaultMjmlTemplate);
    const [htmlContent, setHtmlContent] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isDirty },
    } = useForm<TemplateFormData>({
        resolver: zodResolver(templateSchema),
        defaultValues: {
            name: "",
            subject: "",
            is_default: false,
        },
    });

    // Fetch existing template if editing
    const { data: existingTemplate, isLoading: isLoadingTemplate } = useFetch<Template>(
        getAxiosForUseFetch,
        ["template", templateId?.toString() || ""],
        {
            url: {
                template: API_PATH.TEMPLATES.GET_TEMPLATE,
                variables: [templateId?.toString() || ""],
            },
        },
        {
            enabled: isEditMode && open,
        }
    );

    // Create mutation
    const createMutation = useConfigurableMutation(
        postAxiosForUseFetch,
        ["templates"],
        {
            onSuccess: (data: any) => {
                onSave?.(data);
                handleClose();
            },
        }
    );

    // Update mutation
    const updateMutation = useConfigurableMutation(
        putAxiosForUseFetch,
        ["templates", "template"],
        {
            onSuccess: (data: any) => {
                onSave?.(data);
                handleClose();
            },
        }
    );

    // Populate form when editing
    useEffect(() => {
        if (existingTemplate && isEditMode) {
            reset({
                name: existingTemplate.name,
                subject: existingTemplate.subject,
                is_default: existingTemplate.is_default,
            });
            // Load MJML content or fall back to HTML
            if (existingTemplate.mjml_content) {
                setMjmlContent(existingTemplate.mjml_content);
            } else if (existingTemplate.html_content) {
                // If only HTML is available, wrap it in basic MJML structure
                setMjmlContent(existingTemplate.html_content);
            }
        }
    }, [existingTemplate, isEditMode, reset]);

    // Reset form when modal opens for new template
    useEffect(() => {
        if (open && !isEditMode) {
            reset({
                name: "",
                subject: "",
                is_default: false,
            });
            setMjmlContent(defaultMjmlTemplate);
            setHtmlContent("");
        }
    }, [open, isEditMode, reset]);

    // Convert MJML to HTML for saving
    useEffect(() => {
        const convertMjml = async () => {
            try {
                const mjmlBrowser = await import("mjml-browser");
                const result = mjmlBrowser.default(mjmlContent, { validationLevel: "soft" });
                setHtmlContent(result.html || "");
            } catch (err) {
                console.error("Failed to convert MJML:", err);
            }
        };
        convertMjml();
    }, [mjmlContent]);

    const handleClose = () => {
        reset();
        setMjmlContent(defaultMjmlTemplate);
        setHtmlContent("");
        onClose();
    };

    const onSubmit = async (data: TemplateFormData) => {
        const payload = {
            ...data,
            html_content: htmlContent,
            /* mjml_content: mjmlContent, */
        };

        if (isEditMode && templateId) {
            updateMutation.mutate({
                url: {
                    template: API_PATH.TEMPLATES.UPDATE_TEMPLATE,
                    variables: [templateId.toString()],
                },
                data: payload as UpdateTemplateRequest,
            });
        } else {
            createMutation.mutate({
                url: { template: API_PATH.TEMPLATES.CREATE_TEMPLATE },
                data: payload as CreateTemplateRequest,
            });
        }
    };

    const isSaving = createMutation.isPending || updateMutation.isPending;
    const isDefault = watch("is_default");

    return (
        <FullscreenModal
            open={open}
            onClose={handleClose}
            title={isEditMode ? "Edit Template" : "Create Template"}
            height={100}
            side="bottom"
        >
            <div className="flex flex-col h-full">
                {/* Header Form */}
                <div className="shrink-0 border-b bg-background">
                    <form 
                        id="template-form" 
                        onSubmit={handleSubmit(onSubmit)}
                        className="px-6 py-4"
                    >
                        {isLoadingTemplate && isEditMode ? (
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Template Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Welcome Email"
                                        {...register("name")}
                                        className={cn(errors.name && "border-destructive")}
                                    />
                                    {errors.name && (
                                        <p className="text-xs text-destructive">{errors.name.message}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Email Subject *</Label>
                                    <Input
                                        id="subject"
                                        placeholder="e.g., Welcome to our platform!"
                                        {...register("subject")}
                                        className={cn(errors.subject && "border-destructive")}
                                    />
                                    {errors.subject && (
                                        <p className="text-xs text-destructive">{errors.subject.message}</p>
                                    )}
                                </div>
                                <div className="flex items-end">
                                    <div className="flex items-center gap-3 h-10">
                                        <Switch
                                            id="is_default"
                                            checked={isDefault}
                                            onCheckedChange={(checked) => setValue("is_default", checked)}
                                        />
                                        <Label htmlFor="is_default" className="cursor-pointer">
                                            Set as default template
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* MJML Editor */}
                <div className="flex-1 min-h-0">
                    <MjmlEditor
                        value={mjmlContent}
                        onChange={setMjmlContent}
                        disabled={isLoadingTemplate}
                    />
                </div>

                {/* Footer Actions */}
                <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t bg-background">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isSaving}
                    >
                        <X className="size-5" />
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        form="template-form"
                        disabled={isSaving || isLoadingTemplate}
                    >
                        {isSaving ? (
                            <Loader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                            <Save className="size-5" />
                        )}
                        {isEditMode ? "Update Template" : "Save Template"}
                    </Button>
                </div>
            </div>
        </FullscreenModal>
    );
}
