"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { useConfigurableMutation, useFetch } from "@/hooks/useApiCalls"
import API_PATH from "@/lib/apiPath"
import { getAxiosForUseFetch, postAxiosForUseFetch } from "@/lib/axios"
import type { User } from "@/types/auth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const { authStatus, setUser } = useAuthStore()
    const [isChecking, setIsChecking] = useState(!authStatus)

    const { mutateAsync: refreshToken } = useConfigurableMutation(
        postAxiosForUseFetch,
        ["refreshToken"]
    )

    const { refetch: fetchCurrentUser } = useFetch(
        getAxiosForUseFetch,
        ["currentUser"],
        { url: { template: API_PATH.AUTH.GET_CURRENT_USER } },
        { enabled: false }
    )

    useEffect(() => {
        const checkAuth = async () => {
            if (authStatus) {
                setIsChecking(false)
                return
            }

            try {
                // 1. Refresh Token
                await refreshToken({ url: { template: API_PATH.AUTH.REFRESH_TOKEN } })

                // 2. Get Current User
                const { data: userData, isError } = await fetchCurrentUser()

                if (isError || !userData) {
                    throw new Error("Failed to fetch user")
                }
                const user = (userData as any)?.data || userData
                console.log(user);

                setUser(user as User)
                setIsChecking(false)
            } catch (error) {
                router.push("/onboarding")
            }
        }

        checkAuth()
    }, [authStatus, router, setUser, refreshToken, fetchCurrentUser])

    if (isChecking) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return <>{children}</>
}
