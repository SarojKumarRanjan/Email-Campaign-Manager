import { z } from "zod";

export const createContactSchema = z.object({
    email: z.string().email(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    is_subscribed: z.boolean().optional(),
    custom_fields: z.any().optional(),
    tag_ids: z.array(z.number()).optional(),
})

export type CreateContactInput = z.infer<typeof createContactSchema>;

export const updateContactSchema = z.object({
    email: z.string().email(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    is_subscribed: z.boolean().optional(),
    custom_fields: z.any().optional(),
    tag_ids: z.array(z.number()).optional(),
})

export type UpdateContactInput = z.infer<typeof updateContactSchema>;

export const contactSchema = z.object({
    id: z.number(),
    email: z.string().email(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    is_subscribed: z.boolean().optional(),
    custom_fields: z.any().optional(),
    tag_ids: z.array(z.number()).optional(),
})

export type Contact = z.infer<typeof contactSchema>;