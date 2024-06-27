import LoginForm from "@/components/login/login-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Welcome to ChatLabs"
}

export default function Login({
  searchParams
}: {
  searchParams: { message: string; error_description: string }
}) {
  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <LoginForm />

      {searchParams?.message && (
        <p className="bg-accent text-foreground mt-4 rounded-lg bg-purple-300 p-4 text-center">
          {searchParams.message}
        </p>
      )}

      {searchParams?.error_description && (
        <p className="text-foreground mt-4 rounded-lg bg-red-300 p-4 text-center">
          {searchParams.error_description}
        </p>
      )}
    </div>
  )
}
