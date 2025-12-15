"use client"

import * as React from "react"
import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { OTPForm } from "@/components/otp-form"
import { ModeToggle } from "./mode-toggle"
import { useRouter } from "next/navigation"

type OnboardingStep = "login" | "signup" | "otp"

interface OnboardingProps {
    initialStep?: OnboardingStep
}

export function Onboarding({ initialStep = "login" }: OnboardingProps) {
    const [step, setStep] = React.useState<OnboardingStep>(initialStep)
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0)

    const router = useRouter()

    const imageCount = 7

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % imageCount)
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    const handleLoginClick = () => setStep("login")
    const handleSignupClick = () => setStep("signup")
    const handleSignupSuccess = () => setStep("otp")
    const handleLoginSuccess = () => {
        router.push("/dashboard")
    }
    const handleOtpSuccess = () => {
        router.push("/dashboard")
    }

    const currentImage = `/on${currentImageIndex + 1}.svg`

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        Email Campaign
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-sm">
                        {step === "login" && (
                            <LoginForm onSignupClick={handleSignupClick} onLoginSuccess={handleLoginSuccess} />
                        )}
                        {step === "signup" && (
                            <SignupForm
                                onLoginClick={handleLoginClick}
                                onSignupSuccess={handleSignupSuccess}
                            />
                        )}
                        {step === "otp" && (
                            <OTPForm />
                        )}
                    </div>
                    <div className="absolute bottom-4 right-4">
                        <ModeToggle />
                    </div>
                </div>
            </div>
            <div className="bg-background hidden lg:flex items-center justify-center overflow-hidden">
                <img
                    src={currentImage}
                    alt={`Onboarding slide ${currentImageIndex + 1}`}
                    className="max-w-[90%] max-h-[90%] object-contain "
                    key={currentImage}
                />
            </div>
        </div>
    )
}
