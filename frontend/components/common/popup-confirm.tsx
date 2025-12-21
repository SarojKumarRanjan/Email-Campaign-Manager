"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type PopupConfirmVariant = "info" | "warning" | "error" | "success";

export interface PopupConfirmProps {
    /** Trigger element (button, icon, etc.) */
    children?: React.ReactNode;

    /** Variant determines the color scheme and icon */
    variant?: PopupConfirmVariant;

    /** Title of the confirmation dialog */
    title?: string;

    /** Description/message of the confirmation dialog */
    description?: string;

    /** Text for the cancel button */
    cancelText?: string;

    /** Text for the proceed button */
    proceedText?: string;

    /** Callback when user clicks proceed */
    onProceed?: () => void | Promise<void>;

    /** Callback when user clicks cancel */
    onCancel?: () => void;

    /** Whether the proceed action is loading */
    loading?: boolean;

    /** Custom icon to override the default variant icon */
    customIcon?: React.ReactNode;

    /** Whether to show the icon */
    showIcon?: boolean;

    /** Custom class for the dialog content */
    className?: string;

    /** Disable the proceed button */
    disableProceed?: boolean;

    /** Control the open state externally */
    open?: boolean;

    /** Callback when open state changes */
    onOpenChange?: (open: boolean) => void;
}

const variantConfig: Record<
    PopupConfirmVariant,
    {
        icon: React.ComponentType<{ className?: string }>;
        iconBgColor: string;
        iconColor: string;
        proceedButtonVariant: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    }
> = {
    info: {
        icon: Info,
        iconBgColor: "bg-blue-100 dark:bg-blue-900/30",
        iconColor: "text-blue-600 dark:text-blue-400",
        proceedButtonVariant: "default",
    },
    warning: {
        icon: AlertTriangle,
        iconBgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        proceedButtonVariant: "default",
    },
    error: {
        icon: Trash2,
        iconBgColor: "bg-red-100 dark:bg-red-900/30",
        iconColor: "text-red-600 dark:text-red-400",
        proceedButtonVariant: "destructive",
    },
    success: {
        icon: CheckCircle2,
        iconBgColor: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
        proceedButtonVariant: "default",
    },
};

export default function PopupConfirm({
    children,
    variant = "info",
    title = "Are you sure?",
    description = "This action cannot be undone.",
    cancelText = "Cancel",
    proceedText = "Proceed",
    onProceed,
    onCancel,
    loading = false,
    customIcon,
    showIcon = true,
    className,
    disableProceed = false,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: PopupConfirmProps) {
    const [internalOpen, setInternalOpen] = React.useState(false);

    // Use controlled state if provided, otherwise use internal state
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? (controlledOnOpenChange || (() => { })) : setInternalOpen;

    const config = variantConfig[variant];
    const Icon = config.icon;

    const handleProceed = async () => {
        if (onProceed) {
            await onProceed();
        }
        setOpen(false);
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div onClick={() => setOpen(true)} className="inline-block">
                {children}
            </div>

            <DialogContent className={cn("sm:max-w-md", className)}>
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                    {/* Large Icon on Top */}
                    {showIcon && (
                        <div className={cn(
                            "rounded-full p-4",
                            config.iconBgColor
                        )}>
                            {customIcon || <Icon className={cn("h-12 w-12", config.iconColor)} />}
                        </div>
                    )}

                    {/* Title and Description */}
                    <div className="space-y-2">
                        <DialogTitle className="text-xl font-semibold">
                            {title}
                        </DialogTitle>
                        {description && (
                            <DialogDescription className="text-sm text-muted-foreground">
                                {description}
                            </DialogDescription>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 w-full pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={loading}
                            className="flex-1"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            type="button"
                            variant={config.proceedButtonVariant}
                            onClick={handleProceed}
                            disabled={loading || disableProceed}
                            className="flex-1"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {proceedText}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
