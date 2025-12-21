"use client";

import { useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createContactSchema, updateContactSchema, CreateContactInput, UpdateContactInput } from "@/types/contact";
import { useFetch, useConfigurableMutation } from "@/hooks/useApiCalls";
import { getAxiosForUseFetch, postAxiosForUseFetch, putAxiosForUseFetch } from "@/lib/axios";
import API_PATH from "@/lib/apiPath";
import { Loader2 } from "lucide-react";

interface ContactEditCreateProps {
    contactId?: number;
    children: React.ReactNode;
    onSuccess?: () => void;
}

export default function ContactEditCreate({ contactId, children, onSuccess }: ContactEditCreateProps) {
    const [open, setOpen] = useState(false);
    const isEditMode = !!contactId;

    // Fetch contact data if editing
    const { data: contactData, isLoading: isFetchingContact } = useFetch(
        getAxiosForUseFetch,
        ["contact", contactId?.toString() || ""],
        {
            url: {
                template: API_PATH.CONTACTS.GET_CONTACT.replace(":id", contactId?.toString() || ""),
            },
        },
        {
            enabled: isEditMode && open,
        }
    );

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<CreateContactInput | UpdateContactInput>({
        resolver: zodResolver(isEditMode ? updateContactSchema : createContactSchema),
        defaultValues: contactData || {},
    });

    // Create mutation
    const createMutation = useConfigurableMutation(
        postAxiosForUseFetch,
        ["contactslist"],
        {
            onSuccess: () => {
                setOpen(false);
                reset();
                onSuccess?.();
            },
        }
    );

    // Update mutation
    const updateMutation = useConfigurableMutation(
        putAxiosForUseFetch,
        ["contactslist"],
        {
            onSuccess: () => {
                setOpen(false);
                reset();
                onSuccess?.();
            },
        }
    );

    const onSubmit = (data: CreateContactInput | UpdateContactInput) => {
        if (isEditMode) {
            updateMutation.mutate({
                url: {
                    template: API_PATH.CONTACTS.UPDATE_CONTACT.replace(":id", contactId.toString()),
                },
                data,
            });
        } else {
            createMutation.mutate({
                url: {
                    template: API_PATH.CONTACTS.CREATE_CONTACT,
                },
                data,
            });
        }
    };

    const isLoading = createMutation.isPending || updateMutation.isPending;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side="left" className="w-[70%] sm:max-w-none overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEditMode ? "Edit Contact" : "Create New Contact"}</SheetTitle>
                    <SheetDescription>
                        {isEditMode
                            ? "Update the contact information below."
                            : "Fill in the details to create a new contact."}
                    </SheetDescription>
                </SheetHeader>

                {isFetchingContact ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john.doe@example.com"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="first_name">
                                    First Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="first_name"
                                    placeholder="John"
                                    {...register("first_name")}
                                />
                                {errors.first_name && (
                                    <p className="text-sm text-destructive">{errors.first_name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    placeholder="Doe"
                                    {...register("last_name")}
                                />
                                {errors.last_name && (
                                    <p className="text-sm text-destructive">{errors.last_name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+1 234 567 8900"
                                    {...register("phone")}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">Company</Label>
                                <Input
                                    id="company"
                                    placeholder="Acme Inc."
                                    {...register("company")}
                                />
                                {errors.company && (
                                    <p className="text-sm text-destructive">{errors.company.message}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    id="is_subscribed"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300"
                                    {...register("is_subscribed")}
                                />
                                <Label htmlFor="is_subscribed" className="cursor-pointer">
                                    Subscribed to emails
                                </Label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditMode ? "Update Contact" : "Create Contact"}
                            </Button>
                        </div>
                    </form>
                )}
            </SheetContent>
        </Sheet>
    );
}
