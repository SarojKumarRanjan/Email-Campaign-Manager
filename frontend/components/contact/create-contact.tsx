"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateContactInput, createContactSchema } from "@/types/contact"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    FormControl,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useConfigurableMutation } from "@/hooks/useApiCalls"
import { postAxiosForUseFetch, putAxiosForUseFetch } from "@/lib/axios"
import API_PATH from "@/lib/apiPath"
import { DynamicForm, FieldConfig } from "../common/form/dynamic-form"
import { useFetch } from "@/hooks/useApiCalls"
import { getAxiosForUseFetch } from "@/lib/axios"
import { useEffect } from "react"


export default function CreateContact({ open, onClose, contactId }: { open: boolean, onClose: () => void, contactId?: string }) {


    const formFileds: FieldConfig<CreateContactInput>[] = [
        {
            name: "email",
            label: "Email",
            placeholder: "e.g. admin@example.com",
            type: "email",
            cols: 12,
        },
        {
            name: "first_name",
            placeholder: "e.g. John",
            label: "First Name",
            type: "text",
            cols: 6,
        },
        {
            name: "last_name",
            placeholder: "e.g. Doe",
            label: "Last Name",
            type: "text",
            cols: 6,
        },
        {
            name: "phone",
            placeholder: "e.g. +91334567890",
            label: "Phone",
            type: "text",
            cols: 12,
        },
        {
            name: "company",
            placeholder: "e.g. Company Name",
            label: "Company",
            type: "text",
            cols: 12,
        },
        {
            name: "is_subscribed",
            type: "custom",
            render: ({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Subscribed</FormLabel>
                    </div>
                    <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                    </FormControl>
                </FormItem>
            ),
            cols: 12,
        },
    ]



    const form = useForm<CreateContactInput>({
        resolver: zodResolver(createContactSchema),
        defaultValues: {
            email: "",
            first_name: "",
            last_name: "",
            phone: "",
            company: "",
            is_subscribed: true,
        },
    })

    const { mutate: createContact, isPending } = useConfigurableMutation(
        postAxiosForUseFetch,
        ["contactslist"],
        {
            onSuccess: () => {
                form.reset()
                onClose()


            },
        }
    )

    const { mutate: updateContact, isPending: isUpdatePending } = useConfigurableMutation(
        putAxiosForUseFetch,
        ["contactslist"],
        {
            onSuccess: (data) => {
                
                form.reset()
                onClose()


            },
        }
    )

    const { data: contact } = useFetch(
        getAxiosForUseFetch,
        ["contact", contactId || ""],
        {
            url: { template: API_PATH.CONTACTS.GET_CONTACT, variables: [contactId as string] },
        },
        {
            enabled: !!contactId,
        }
    )

    useEffect(() => {
        if (contact) {
            form.reset(contact)
        }
    }, [contact])

    const onSubmit = (data: CreateContactInput) => {
        if (contactId) {
            updateContact({
                url: { template: API_PATH.CONTACTS.UPDATE_CONTACT, variables: [contactId as string] },
                data,
            })
        } else {
            createContact({
                url: { template: API_PATH.CONTACTS.CREATE_CONTACT },
                data,
            })
        }
    }

    const handleCancel = () => {
        form.reset()
        onClose()

    }

    return (
        <Dialog open={open} onOpenChange={handleCancel} >
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{contactId ? "Edit" : "Create"} Contact</DialogTitle>
                    <DialogDescription>
                        {contactId ? "Edit" : "Add"} a new contact to your list. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <DynamicForm
                    form={form}
                    onSubmit={onSubmit}
                    fields={formFileds}
                >
                    <DialogFooter >
                        <DialogClose asChild>
                            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending || isUpdatePending}>
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </DynamicForm>

            </DialogContent>
        </Dialog>
    )
}