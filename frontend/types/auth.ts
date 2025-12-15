import { z } from "zod"

export const signupSchema = z.object({
    first_name: z.string().min(2, { message: "First name must be at least 2 characters" }),
    last_name: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})


export type SignupFormValues = z.infer<typeof signupSchema>

export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const otpSchema = z.object({
    otp: z.string().length(6, { message: "OTP must be 6 digits" }),
})

export type OTPFormValues = z.infer<typeof otpSchema>


export interface User {
    id: number,
    email: string,
    first_name: string,
    last_name: string,
    company_name: string,
    is_active: boolean,
    email_verified: boolean,
    created_at: string,
    updated_at: string,
    last_login_at: string | null
}

