import { Database } from "@/supabase/types"
import { createBrowserClient } from "@supabase/ssr"
import { getHomeWorkspaceByUserId } from "@/db/workspaces"

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function getCurrentUser(client = supabase) {
  const session = await client.auth.getSession()
  return session?.data?.session?.user
}

export async function getCurrentUserHomeWorkspaceId(client = supabase) {
  const user = await getCurrentUser(client)
  if (!user) return
  return await getHomeWorkspaceByUserId(user?.id, client)
}
