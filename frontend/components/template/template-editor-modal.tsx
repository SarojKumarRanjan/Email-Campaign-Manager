"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FullscreenModal } from "@/components/common/fullscreen-modal";
import { MjmlEditor, defaultMjmlTemplate } from "./mjml-editor";
import { HtmlEditor, defaultHtmlTemplate } from "./html-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, Loader2, Code2, Layout } from "lucide-react";
import { useFetch, useConfigurableMutation } from "@/hooks/useApiCalls";
import { getAxiosForUseFetch, postAxiosForUseFetch, putAxiosForUseFetch } from "@/lib/axios";
import API_PATH from "@/lib/apiPath";
import { Template, CreateTemplateRequest, UpdateTemplateRequest } from "@/types/template";
import { cn } from "@/lib/utils";

const templateSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    subject: z.string().min(1, "Subject is required"),
    type: z.enum(["mjml", "html"]),
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
    const [htmlContent, setHtmlContent] = useState(defaultHtmlTemplate);
    const [renderedHtml, setRenderedHtml] = useState("");

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
            type: "mjml",
            is_default: false,
        },
    });

    const activeType = watch("type");

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
                type: existingTemplate.type || "mjml",
                is_default: existingTemplate.is_default,
            });
            // Load content based on type
            if (existingTemplate.type === "mjml") {
                setMjmlContent(existingTemplate.mjml_content || defaultMjmlTemplate);
                setRenderedHtml(existingTemplate.html_content);
            } else {
                setHtmlContent(existingTemplate.html_content || defaultHtmlTemplate);
            }
        }
    }, [existingTemplate, isEditMode, reset]);

    // Reset form when modal opens for new template
    useEffect(() => {
        if (open && !isEditMode) {
            reset({
                name: "",
                subject: "",
                type: "mjml",
                is_default: false,
            });
            setMjmlContent(defaultMjmlTemplate);
            setHtmlContent(defaultHtmlTemplate);
            setRenderedHtml("");
        }
    }, [open, isEditMode, reset]);

    // Convert MJML to HTML for saving
    useEffect(() => {
        if (activeType !== "mjml") return;

        const convertMjml = async () => {
            try {
                const mjmlBrowser = await import("mjml-browser");
                const result = mjmlBrowser.default(mjmlContent, { validationLevel: "soft" });
                setRenderedHtml(result.html || "");
            } catch (err) {
                console.error("Failed to convert MJML:", err);
            }
        };
        const timer = setTimeout(convertMjml, 500);
        return () => clearTimeout(timer);
    }, [mjmlContent, activeType]);

    const handleClose = () => {
        reset();
        setMjmlContent(defaultMjmlTemplate);
        setHtmlContent(defaultHtmlTemplate);
        setRenderedHtml("");
        onClose();
    };

    const onSubmit = async (data: TemplateFormData) => {
        const payload: any = {
            ...data,
            html_content: data.type === "mjml" ? renderedHtml : htmlContent,
            mjml_content: data.type === "mjml" ? mjmlContent : "",
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
            scrollable={false}
            footer={
                <div className="flex items-center justify-end gap-3 px-6 py-4">
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
            }
        >
            <div className="flex flex-col h-full min-h-0">
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
                {/* Editor Toggle */}
                <div className="shrink-0 border-b bg-muted/20 px-6 py-2">
                    <Tabs 
                        value={activeType} 
                        onValueChange={(v) => setValue("type", v as "mjml" | "html", { shouldDirty: true })}
                    >
                        <TabsList className="grid w-[400px] grid-cols-2">
                            <TabsTrigger value="mjml" className="gap-2">
                                <Layout className="size-4" />
                                MJML Builder
                            </TabsTrigger>
                            <TabsTrigger value="html" className="gap-2">
                                <Code2 className="size-4" />
                                HTML Editor
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Editor Content */}
                <div className="flex-1 min-h-0">
                    {activeType === "mjml" ? (
                        <MjmlEditor
                            value={mjmlContent}
                            onChange={setMjmlContent}
                            disabled={isLoadingTemplate}
                        />
                    ) : (
                        <HtmlEditor
                            value={htmlContent}
                            onChange={setHtmlContent}
                            disabled={isLoadingTemplate}
                        />
                    )}
                </div>
            </div>
        </FullscreenModal>
    );
}
