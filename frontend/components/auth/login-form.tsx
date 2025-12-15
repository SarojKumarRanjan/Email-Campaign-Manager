import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useConfigurableMutation } from "@/hooks/useApiCalls"
import { postAxiosForUseFetch } from "@/lib/axios"
import API_PATH from "@/lib/apiPath"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormValues, User } from "@/types/auth"
import { useAuthStore } from "@/store/auth.store"

export function LoginForm({
  className,
  onSignupClick,
  onLoginSuccess,
  ...props
}: React.ComponentProps<"form"> & { onSignupClick?: () => void, onLoginSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const setUser = useAuthStore((state) => state.setUser)


  const { mutate: loginMutation, isPending } = useConfigurableMutation(
    postAxiosForUseFetch,
    ["login"],
    {
      onSuccess: (data) => {
        if (data?.user) {
          setUser(data?.user as User)
          localStorage.setItem("refresh_token", data.refresh_token)
          onLoginSuccess?.()
        }
      },
    }
  )

  const onSubmit = (data: LoginFormValues) => {
    loginMutation({
      url: { template: API_PATH.AUTH.LOGIN },
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
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm">
          Enter your email below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
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
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            {...register("password")}
          />
          <FieldError errors={[{ message: errors.password?.message }]} />
        </Field>
        <Field>
          <Button type="submit" disabled={isSubmitting || isPending}>
            {isSubmitting || isPending ? "Logging in..." : "Login"}
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
          Login with Google
        </Button>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <button type="button" onClick={onSignupClick} className="underline underline-offset-4">
            Sign up
          </button>
        </div>
      </div>
    </form>
  )
}
