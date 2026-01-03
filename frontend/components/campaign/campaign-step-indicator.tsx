"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
    id: number;
    name: string;
    description?: string;
}

interface CampaignStepIndicatorProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (step: number) => void;
    className?: string;
}

export function CampaignStepIndicator({
    steps,
    currentStep,
    onStepClick,
    className,
}: CampaignStepIndicatorProps) {
    return (
        <nav aria-label="Progress" className={cn("w-full", className)}>
            <ol className="flex items-center">
                {steps.map((step, index) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;
                    const isClickable = onStepClick && step.id <= currentStep;

                    return (
                        <li
                            key={step.id}
                            className={cn(
                                "relative flex-1",
                                index !== steps.length - 1 && "pr-8 sm:pr-20"
                            )}
                        >
                            <div
                                className={cn(
                                    "group relative flex items-center",
                                    isClickable && "cursor-pointer"
                                )}
                                onClick={() => isClickable && onStepClick?.(step.id)}
                            >
                                {/* Step Circle */}
                                <span className="flex h-9 items-center">
                                    <span
                                        className={cn(
                                            "relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                                            isCompleted && "bg-primary text-primary-foreground",
                                            isCurrent && "border-2 border-primary bg-background",
                                            !isCompleted && !isCurrent && "border-2 border-border bg-background"
                                        )}
                                    >
                                        {isCompleted ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <span
                                                className={cn(
                                                    "text-sm font-medium",
                                                    isCurrent && "text-primary",
                                                    !isCurrent && "text-muted-foreground"
                                                )}
                                            >
                                                {step.id}
                                            </span>
                                        )}
                                    </span>
                                </span>

                                {/* Step Label */}
                                <span className="ml-3 hidden sm:block">
                                    <span
                                        className={cn(
                                            "text-sm font-medium",
                                            isCurrent && "text-foreground",
                                            !isCurrent && "text-muted-foreground"
                                        )}
                                    >
                                        {step.name}
                                    </span>
                                    {step.description && (
                                        <span className="block text-xs text-muted-foreground">
                                            {step.description}
                                        </span>
                                    )}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

// Default campaign creation steps
export const campaignSteps: Step[] = [
    { id: 1, name: "Basic Info", description: "Campaign details" },
    { id: 2, name: "Template", description: "Select or create" },
    { id: 3, name: "Recipients", description: "Target audience" },
    { id: 4, name: "Review", description: "Final check" },
];
