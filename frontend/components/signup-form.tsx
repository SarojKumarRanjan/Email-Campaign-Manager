import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useConfigurableMutation } from "@/hooks/useApiCalls"
import { postAxiosForUseFetch } from "@/lib/axios"
import API_PATH from "@/lib/apiPath"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, type SignupFormValues } from "@/types/auth"

export function SignupForm({
  className,
  onLoginClick,
  onSignupSuccess,
  ...props
}: React.ComponentProps<"form"> & { onLoginClick?: () => void; onSignupSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
  })

  // Use the custom mutation hook
  const { mutate: signupMutation, isPending } = useConfigurableMutation(
    postAxiosForUseFetch,
    {
      onSuccess: () => {
        onSignupSuccess?.()
      },
    }
  )

  const onSubmit = (data: SignupFormValues) => {
    signupMutation({
      url: { template: API_PATH.AUTH.REGISTER },
      data,
    })
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground text-sm">
          Enter your details below to create your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="first_name">First Name</FieldLabel>
            <Input
              id="first_name"
              placeholder="John"
              {...register("first_name")}
            />
            <FieldError errors={[{ message: errors.first_name?.message }]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
            <Input
              id="last_name"
              placeholder="Doe"
              {...register("last_name")}
            />
            <FieldError errors={[{ message: errors.last_name?.message }]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register("email")}
            />
            <FieldError errors={[{ message: errors.email?.message }]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              {...register("password")}
            />
            <FieldDescription>
              Must be at least 8 characters long.
            </FieldDescription>
            <FieldError errors={[{ message: errors.password?.message }]} />
          </Field>
        </div>
        <Field>
          <Button type="submit" disabled={isSubmitting || isPending}>
            {isSubmitting || isPending ? "Creating account..." : "Create Account"}
          </Button>
        </Field>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <Button variant="outline" className="w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.107-3.293 2.133-2.133 2.72-5.133 2.48-7.787h-10.587z"
              fill="currentColor"
            />
          </svg>
          Sign up with Google
        </Button>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <button type="button" onClick={onLoginClick} className="underline underline-offset-4">
            Sign in
          </button>
        </div>
      </div>
    </form>
  )
}
