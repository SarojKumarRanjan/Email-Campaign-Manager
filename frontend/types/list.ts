import z from "zod";

export const listSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    description: z.string().optional(),
    color: z.string().optional(),
})

export type List = z.infer<typeof listSchema> & {
    id: number;
    user_id: number;
    contact_count: number;
    campaign_count: number;
    created_at: string;
    updated_at: string;
}
