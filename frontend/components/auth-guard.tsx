"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { useFetch } from "@/hooks/useApiCalls"
import API_PATH from "@/lib/apiPath"
import { getAxiosForUseFetch } from "@/lib/axios"
import type { User } from "@/types/auth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { authStatus, setUser } = useAuthStore()
    const [isChecking, setIsChecking] = useState(!authStatus)

    const { data, isError, isLoading, isSuccess } = useFetch(
        getAxiosForUseFetch,
        ["currentUser"],
        { url: { template: API_PATH.AUTH.GET_CURRENT_USER } },
        {
            enabled: !authStatus,
            retry: false,
        }
    ) as any

    useEffect(() => {
        if (authStatus) {
            setIsChecking(false)
            return
        }

        if (isSuccess && data) {

            const user = (data as any).user || data
            setUser(user as User)
            setIsChecking(false)
        } else if (isError) {
            router.push("/login")
        }
    }, [authStatus, isSuccess, isError, data, setUser, router])

    if (isChecking || isLoading) {
        // You can replace this with a proper loading spinner component
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // If we are here, we are authenticated (or about to redirect if error logic failed somehow, but useEffect handles that)
    return <>{children}</>
}
