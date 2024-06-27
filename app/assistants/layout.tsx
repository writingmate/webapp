import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { Dashboard } from "@/components/ui/dashboard"

export default async function Layout({
  children
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const isAnon = !(await supabase.auth.getSession()).data.session

  if (isAnon) {
    return <>{children}</>
  }

  return (
    <>
      <Dashboard>{children}</Dashboard>
    </>
  )
}
