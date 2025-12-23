import z from "zod";

export const listSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long"),
    description: z.string().optional(),
    color: z.string().optional(),
})

export type List = z.infer<typeof listSchema>
