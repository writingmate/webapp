import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"
import { SupabaseClient } from "@supabase/supabase-js"

export const getHomeWorkspaceByUserId = async (
  userId: string,
  client?: SupabaseClient
) => {
  const { data: homeWorkspace, error } = await (client || supabase)
    .from("workspaces")
    .select("*")
    .eq("user_id", userId)
    .eq("is_home", true)
    .single()

  if (!homeWorkspace) {
    throw new Error(error?.message)
  }

  return homeWorkspace.id
}

export const getWorkspaceById = async (workspaceId: string) => {
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select(
      `*, 
    chats(*),
    assistants(*), 
    folders(*), 
    files(*), 
    presets(*), 
    prompts(*), 
    tools(*), 
    models(*)`
    )
    .eq("id", workspaceId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return workspace
}

export const getWorkspacesByUserId = async (
  userId: string,
  client?: SupabaseClient
) => {
  const { data: workspaces, error } = await (supabase || client)
    .from("workspaces")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (!workspaces) {
    throw new Error(error.message)
  }

  return workspaces
}

export const createWorkspace = async (
  workspace: TablesInsert<"workspaces">
) => {
  const { data: createdWorkspace, error } = await supabase
    .from("workspaces")
    .insert([workspace])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdWorkspace
}

export const updateWorkspace = async (
  workspaceId: string,
  workspace: TablesUpdate<"workspaces">
) => {
  const { data: updatedWorkspace, error } = await supabase
    .from("workspaces")
    .update(workspace)
    .eq("id", workspaceId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedWorkspace
}

export const deleteWorkspace = async (workspaceId: string) => {
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}
