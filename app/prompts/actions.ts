"use server"

import {
  getCurrentUser,
  getCurrentUserHomeWorkspaceId
} from "@/lib/supabase/browser-client"
import { createPrompt, deletePrompt as deletePromptDb } from "@/db/prompts"
import { Tables } from "@/supabase/types"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function deletePrompt(prompt: Tables<"prompts">) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  await deletePromptDb(prompt.id, supabase)

  revalidatePath("/prompts", "page")
  redirect("/prompts")
}

export async function copyPrompt(prompt: Tables<"prompts">) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const user = await getCurrentUser(supabase)
  const workspaceId = await getCurrentUserHomeWorkspaceId(supabase)

  if (!workspaceId) {
    throw new Error("User has no workspace")
  }

  await createPrompt(
    {
      user_id: user?.id!,
      icon: prompt.icon,
      name: prompt.name,
      description: prompt.description,
      content: prompt.content,
      sharing: "private"
    },
    workspaceId,
    supabase
  )

  revalidatePath("/prompts", "page")
}
