"use client"
import { Onboarding } from "@/components/auth/onboarding"
import { useAuthStore } from "@/store/auth.store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function OnboardingPage() {
    const authStatus = useAuthStore((state) => state.authStatus)
    const router = useRouter()

    useEffect(() => {
        if (authStatus) {
            router.push("/dashboard")
        }
    }, [authStatus, router])
    return <Onboarding initialStep="login" />
}
