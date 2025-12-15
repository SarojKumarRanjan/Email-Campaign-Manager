import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useConfigurableMutation } from "@/hooks/useApiCalls"
import { postAxiosForUseFetch } from "@/lib/axios"
import API_PATH from "@/lib/apiPath"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { otpSchema, type OTPFormValues } from "@/types/auth"

export function OTPForm({ className, ...props }: React.ComponentProps<"div">) {
  const {
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  // Use the custom mutation hook
  const { mutate: verifyOtpMutation, isPending } = useConfigurableMutation(
    postAxiosForUseFetch,
    ["verifyOtp"],
    {
      onSuccess: () => {
        console.log("OTP Verified")
      },
    }
  )

  const onSubmit = (data: OTPFormValues) => {
    verifyOtpMutation({
      url: { template: API_PATH.AUTH.VERIFY_EMAIL },
      data,
    })
  }

  const otpValue = watch("otp")

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Enter verification code</h1>
            <p className="text-muted-foreground text-sm text-balance">
              We sent a 4-digit code to your email.
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="otp" className="sr-only">
              Verification code
            </FieldLabel>
            <InputOTP
              maxLength={6}
              id="otp"
              value={otpValue}
              onChange={(value) => setValue("otp", value)}
            >
              <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldError errors={[{ message: errors.otp?.message }]} />
            <FieldDescription className="text-center">
              Enter the 6-digit code sent to your email.
            </FieldDescription>
          </Field>
          <Button type="submit" disabled={isSubmitting || isPending}>
            {isSubmitting || isPending ? "Verifying..." : "Verify"}
          </Button>
          <FieldDescription className="text-center">
            Didn&apos;t receive the code? <a href="#">Resend</a>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  )
}
