"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FullscreenModal } from "@/components/common/fullscreen-modal";
import { CampaignStepIndicator, campaignSteps } from "./campaign-step-indicator";
import { TemplateSelector } from "./template-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    ArrowLeft, 
    ArrowRight, 
    Save, 
    Loader2,
    Calendar,
    Users,
    Mail,
    FileText,
    Clock,
    CheckCircle2
} from "lucide-react";
import { useFetch, useConfigurableMutation } from "@/hooks/useApiCalls";
import { getAxiosForUseFetch, postAxiosForUseFetch, putAxiosForUseFetch } from "@/lib/axios";
import API_PATH from "@/lib/apiPath";
import { Campaign } from "@/types/campaign";
import { Template } from "@/types/template";
import { cn } from "@/lib/utils";
import { Heading, MutedText, Small } from "@/components/common/typography";
import { AsyncSelect, Option } from "@/components/common/form/multi-select";
import { DatePickerWithRange, TimePicker } from "@/components/common/form/date-time-picker";
import { format } from "date-fns";

// Form Schema
const campaignSchema = z.object({
    // Step 1
    name: z.string().min(1, "Campaign name is required"),
    subject: z.string().min(1, "Subject line is required"),
    from_name: z.string().min(1, "From name is required"),
    from_email: z.string().email("Valid email is required"),
    reply_to_email: z.string().email().optional().or(z.literal("")),
    // Step 2
    template_id: z.number().nullable(),
    html_content: z.string().optional(),
    // Step 3
    tag_ids: z.array(z.number()).min(1, "Select at least one tag"),
    // Step 4
    scheduled_at: z.date().nullable().optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignFormModalProps {
    open: boolean;
    onClose: () => void;
    campaignId?: number | null;
    onSave?: () => void;
}

export function CampaignFormModal({
    open,
    onClose,
    campaignId,
    onSave,
}: CampaignFormModalProps) {
    const isEditMode = !!campaignId;
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        watch,
        trigger,
        formState: { errors },
    } = useForm<CampaignFormData>({
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            name: "",
            subject: "",
            from_name: "",
            from_email: "",
            reply_to_email: "",
            template_id: null,
            html_content: "",
            tag_ids: [],
            scheduled_at: null,
        },
    });

    const formValues = watch();

    // Fetch existing campaign if editing
    const { data: existingCampaign, isLoading: isLoadingCampaign } = useFetch<Campaign>(
        getAxiosForUseFetch,
        ["campaign", campaignId?.toString() || ""],
        {
            url: {
                template: API_PATH.CAMPAIGNS.GET_CAMPAIGN,
                variables: [campaignId?.toString() || ""],
            },
        },
        {
            enabled: isEditMode && open,
        }
    );

    // Create mutation
    const createMutation = useConfigurableMutation(
        postAxiosForUseFetch,
        ["campaigns"],
        {
            onSuccess: () => {
                onSave?.();
                handleClose();
            },
        }
    );

    // Update mutation
    const updateMutation = useConfigurableMutation(
        putAxiosForUseFetch,
        ["campaigns", "campaign"],
        {
            onSuccess: () => {
                onSave?.();
                handleClose();
            },
        }
    );

    // Load tags for async select
    const loadTags = async (inputValue: string): Promise<Option[]> => {
        try {
            const response = await getAxiosForUseFetch(
                `${API_PATH.TAGS.LIST_TAGS}?search=${inputValue}&limit=50`
            );
            const tags = response.data?.data || [];
            return tags.map((tag: any) => ({
                value: tag.id.toString(),
                label: tag.name,
            }));
        } catch {
            return [];
        }
    };

    // Populate form when editing
    useEffect(() => {
        if (existingCampaign && isEditMode) {
            reset({
                name: existingCampaign.name,
                subject: existingCampaign.subject,
                from_name: existingCampaign.from_name,
                from_email: existingCampaign.from_email,
                reply_to_email: existingCampaign.reply_to_email || "",
                template_id: existingCampaign.template_id || null,
                tag_ids: existingCampaign.tags?.map((t: any) => t.id) || [],
                scheduled_at: existingCampaign.scheduled_at 
                    ? new Date(existingCampaign.scheduled_at) 
                    : null,
            });
            if (existingCampaign.template) {
                setSelectedTemplate(existingCampaign.template);
            }
        }
    }, [existingCampaign, isEditMode, reset]);

    // Reset form when modal opens for new campaign
    useEffect(() => {
        if (open && !isEditMode) {
            reset({
                name: "",
                subject: "",
                from_name: "",
                from_email: "",
                reply_to_email: "",
                template_id: null,
                html_content: "",
                tag_ids: [],
                scheduled_at: null,
            });
            setCurrentStep(1);
            setSelectedTemplate(null);
        }
    }, [open, isEditMode, reset]);

    const handleClose = () => {
        reset();
        setCurrentStep(1);
        setSelectedTemplate(null);
        onClose();
    };

    // Step validation
    const validateStep = async (step: number): Promise<boolean> => {
        switch (step) {
            case 1:
                return await trigger(["name", "subject", "from_name", "from_email"]);
            case 2:
                // Template is optional
                return true;
            case 3:
                return await trigger(["tag_ids"]);
            case 4:
                return true;
            default:
                return true;
        }
    };

    const handleNext = async () => {
        const isValid = await validateStep(currentStep);
        if (isValid && currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepClick = async (step: number) => {
        if (step < currentStep) {
            setCurrentStep(step);
        } else if (step === currentStep + 1) {
            const isValid = await validateStep(currentStep);
            if (isValid) {
                setCurrentStep(step);
            }
        }
    };

    const onSubmit = async (data: CampaignFormData) => {
        const payload = {
            ...data,
            reply_to_email: data.reply_to_email || undefined,
            scheduled_at: data.scheduled_at?.toISOString() || undefined,
        };

        if (isEditMode && campaignId) {
            updateMutation.mutate({
                url: {
                    template: API_PATH.CAMPAIGNS.UPDATE_CAMPAIGN,
                    variables: [campaignId.toString()],
                },
                data: payload,
            });
        } else {
            createMutation.mutate({
                url: { template: API_PATH.CAMPAIGNS.CREATE_CAMPAIGN },
                data: payload,
            });
        }
    };

    const handleSaveAsDraft = () => {
        handleSubmit(onSubmit)();
    };

    const handleTemplateSelect = (templateId: number | null, template?: Template) => {
        setValue("template_id", templateId);
        setSelectedTemplate(template || null);
    };

    const isSaving = createMutation.isPending || updateMutation.isPending;

    // Render step content
    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <div>
                            <Heading level={4}>Campaign Details</Heading>
                            <MutedText>Enter the basic information for your email campaign.</MutedText>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Campaign Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., January Newsletter"
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
                                    placeholder="e.g., Check out our latest updates!"
                                    {...register("subject")}
                                    className={cn(errors.subject && "border-destructive")}
                                />
                                {errors.subject && (
                                    <p className="text-xs text-destructive">{errors.subject.message}</p>
                                )}
                            </div>

                            <Separator />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="from_name">From Name *</Label>
                                    <Input
                                        id="from_name"
                                        placeholder="e.g., John from Company"
                                        {...register("from_name")}
                                        className={cn(errors.from_name && "border-destructive")}
                                    />
                                    {errors.from_name && (
                                        <p className="text-xs text-destructive">{errors.from_name.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="from_email">From Email *</Label>
                                    <Input
                                        id="from_email"
                                        type="email"
                                        placeholder="e.g., newsletter@company.com"
                                        {...register("from_email")}
                                        className={cn(errors.from_email && "border-destructive")}
                                    />
                                    {errors.from_email && (
                                        <p className="text-xs text-destructive">{errors.from_email.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reply_to_email">Reply-To Email (Optional)</Label>
                                <Input
                                    id="reply_to_email"
                                    type="email"
                                    placeholder="e.g., support@company.com"
                                    {...register("reply_to_email")}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="max-w-2xl mx-auto">
                            <Heading level={4}>Choose a Template</Heading>
                            <MutedText>Select an existing template or create a new one for this campaign.</MutedText>
                        </div>
                        
                        <TemplateSelector
                            selectedTemplateId={formValues.template_id}
                            onSelect={handleTemplateSelect}
                        />
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6 max-w-2xl mx-auto">
                        <div>
                            <Heading level={4}>Select Recipients</Heading>
                            <MutedText>Choose the tags of contacts who will receive this campaign.</MutedText>
                        </div>

                        <div className="space-y-2">
                            <Label>Target Tags *</Label>
                            <Controller
                                name="tag_ids"
                                control={control}
                                render={({ field }) => (
                                    <AsyncSelect
                                        loadOptions={loadTags}
                                        value={field.value.map((id) => id.toString())}
                                        onChange={(values: string | string[]) => {
                                            const ids = Array.isArray(values) 
                                                ? values.map((v) => parseInt(v))
                                                : [parseInt(values)];
                                            field.onChange(ids);
                                        }}
                                        isMulti={true}
                                        placeholder="Search and select tags..."
                                        defaultOptions={[]}
                                    />
                                )}
                            />
                            {errors.tag_ids && (
                                <p className="text-xs text-destructive">{errors.tag_ids.message}</p>
                            )}
                            <MutedText className="text-xs">
                                All contacts with the selected tags will receive this email.
                            </MutedText>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label>Schedule (Optional)</Label>
                            <Controller
                                name="scheduled_at"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex items-center gap-4">
                                        <Input
                                            type="datetime-local"
                                            value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""}
                                            onChange={(e) => {
                                                field.onChange(e.target.value ? new Date(e.target.value) : null);
                                            }}
                                            className="max-w-xs"
                                        />
                                        {field.value && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => field.onChange(null)}
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                )}
                            />
                            <MutedText className="text-xs">
                                Leave empty to save as draft and send manually later.
                            </MutedText>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6 max-w-3xl mx-auto">
                        <div>
                            <Heading level={4}>Review Campaign</Heading>
                            <MutedText>Review your campaign details before saving.</MutedText>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Campaign Details */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Mail className="size-4" />
                                        Campaign Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <Small className="text-muted-foreground">Name</Small>
                                        <p className="font-medium">{formValues.name || "-"}</p>
                                    </div>
                                    <div>
                                        <Small className="text-muted-foreground">Subject</Small>
                                        <p className="font-medium">{formValues.subject || "-"}</p>
                                    </div>
                                    <div>
                                        <Small className="text-muted-foreground">From</Small>
                                        <p className="font-medium">
                                            {formValues.from_name} &lt;{formValues.from_email}&gt;
                                        </p>
                                    </div>
                                    {formValues.reply_to_email && (
                                        <div>
                                            <Small className="text-muted-foreground">Reply-To</Small>
                                            <p className="font-medium">{formValues.reply_to_email}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Template */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <FileText className="size-4" />
                                        Template
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {selectedTemplate ? (
                                        <div className="flex items-center gap-3">
                                            <div className="size-16 bg-muted rounded flex items-center justify-center">
                                                <FileText className="size-6 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{selectedTemplate.name}</p>
                                                <Small className="text-muted-foreground">
                                                    {selectedTemplate.subject}
                                                </Small>
                                            </div>
                                        </div>
                                    ) : (
                                        <MutedText>No template selected (custom HTML or none)</MutedText>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Recipients */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Users className="size-4" />
                                        Recipients
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {formValues.tag_ids.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {formValues.tag_ids.map((tagId) => (
                                                <Badge key={tagId} variant="secondary">
                                                    Tag #{tagId}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <MutedText>No tags selected</MutedText>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Schedule */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Clock className="size-4" />
                                        Schedule
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {formValues.scheduled_at ? (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="size-4 text-primary" />
                                            <p className="font-medium">
                                                {format(formValues.scheduled_at, "PPP 'at' p")}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">Draft</Badge>
                                            <MutedText>Will be saved as draft</MutedText>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Ready Indicator */}
                        <Card className="bg-primary/5 border-primary/20">
                            <CardContent className="py-6">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="size-6 text-primary" />
                                    <div>
                                        <p className="font-medium">Ready to save</p>
                                        <MutedText className="text-sm">
                                            {formValues.scheduled_at
                                                ? "Your campaign will be scheduled for the specified time."
                                                : "Your campaign will be saved as a draft."}
                                        </MutedText>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <FullscreenModal
            open={open}
            onClose={handleClose}
            title={isEditMode ? "Edit Campaign" : "Create Campaign"}
            height={100}
            side="bottom"
        >
            <div className="flex flex-col h-full">
                {/* Step Indicator */}
                <div className="shrink-0 px-6 py-4 border-b bg-background">
                    <CampaignStepIndicator
                        steps={campaignSteps}
                        currentStep={currentStep}
                        onStepClick={handleStepClick}
                    />
                </div>

                {/* Step Content */}
                <ScrollArea className="flex-1">
                    <div className="p-6">
                        {isLoadingCampaign && isEditMode ? (
                            <div className="space-y-4 max-w-2xl mx-auto">
                                <Skeleton className="h-8 w-48" />
                                <Skeleton className="h-4 w-64" />
                                <div className="space-y-4 mt-6">
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            </div>
                        ) : (
                            renderStepContent()
                        )}
                    </div>
                </ScrollArea>

                {/* Footer Actions */}
                <div className="shrink-0 flex items-center justify-end gap-4 px-6 py-4 border-t bg-background">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentStep === 1 || isSaving}
                    >
                        <ArrowLeft className="size-5 " />
                        Previous
                    </Button>

                    <div className="flex items-center gap-3">
                        {currentStep === 4 ? (
                            <>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleSaveAsDraft}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <Loader2 className="size-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="size-5" />
                                    )}
                                    {formValues.scheduled_at ? "Schedule Campaign" : "Save as Draft"}
                                </Button>
                            </>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={isSaving}
                            >
                                Next
                                <ArrowRight className="size-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </FullscreenModal>
    );
}
