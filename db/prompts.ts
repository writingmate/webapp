import { supabase } from "@/lib/supabase/browser-client"
import { Tables, TablesInsert, TablesUpdate } from "@/supabase/types"
import { SupabaseClient } from "@supabase/supabase-js"

export const getPromptById = async (promptId: string) => {
  const { data: prompt, error } = await supabase
    .from("prompts")
    .select("*, prompt_category(id, name)")
    .eq("hashid", promptId)
    .single()

  if (!prompt) {
    throw new Error(error.message)
  }

  return prompt
}

export const getPromptWorkspacesByWorkspaceId = async (
  workspaceId: string,
  search?: { category?: string; query?: string },
  client: SupabaseClient = supabase
) => {
  const query = client
    .from("workspaces")
    .select(
      `
      id,
      name,
      prompts (*, prompt_category(id, name))
    `
    )
    .eq("id", workspaceId)

  if (search?.category) {
    query.eq("prompts.prompt_category.name", search.category)
  }

  if (search?.query) {
    query.or(
      `name.ilike.%${search.query}%,description.ilike.%${search.query}%,content.ilike.%${search.query}%`,
      {
        referencedTable: "prompts"
      }
    )
  }

  const { data: workspace, error } = await query.single()

  if (!workspace) {
    throw new Error(error.message)
  }

  return workspace
}

export const getPromptWorkspacesByPromptId = async (promptId: string) => {
  const { data: prompt, error } = await supabase
    .from("prompts")
    .select(
      `
      id, 
      name, 
      workspaces (*)
    `
    )
    .eq("id", promptId)
    .single()

  if (!prompt) {
    throw new Error(error.message)
  }

  return prompt
}

export const createPrompt = async (
  prompt: TablesInsert<"prompts">,
  workspace_id: string,
  client: SupabaseClient = supabase
) => {
  const { data: createdPrompt, error } = await client
    .from("prompts")
    .insert([prompt])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await createPromptWorkspace(
    {
      user_id: createdPrompt.user_id,
      prompt_id: createdPrompt.id,
      workspace_id
    },
    client
  )

  return createdPrompt
}

export const createPrompts = async (
  prompts: TablesInsert<"prompts">[],
  workspace_id: string
) => {
  const { data: createdPrompts, error } = await supabase
    .from("prompts")
    .insert(prompts)
    .select("*")

  if (error) {
    throw new Error(error.message)
  }

  await createPromptWorkspaces(
    createdPrompts.map(prompt => ({
      user_id: prompt.user_id,
      prompt_id: prompt.id,
      workspace_id
    }))
  )

  return createdPrompts
}

export const createPromptWorkspace = async (
  item: {
    user_id: string
    prompt_id: string
    workspace_id: string
  },
  client: SupabaseClient = supabase
) => {
  const { data: createdPromptWorkspace, error } = await client
    .from("prompt_workspaces")
    .insert([item])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdPromptWorkspace
}

export const createPromptWorkspaces = async (
  items: { user_id: string; prompt_id: string; workspace_id: string }[]
) => {
  const { data: createdPromptWorkspaces, error } = await supabase
    .from("prompt_workspaces")
    .insert(items)
    .select("*")

  if (error) throw new Error(error.message)

  return createdPromptWorkspaces
}

export const updatePrompt = async (
  promptId: string,
  prompt: TablesUpdate<"prompts">
) => {
  const { data: updatedPrompt, error } = await supabase
    .from("prompts")
    .update(prompt)
    .eq("id", promptId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedPrompt
}

export const deletePrompt = async (
  promptId: string,
  client: SupabaseClient = supabase
) => {
  const { error } = await client.from("prompts").delete().eq("id", promptId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const deletePromptWorkspace = async (
  promptId: string,
  workspaceId: string
) => {
  const { error } = await supabase
    .from("prompt_workspaces")
    .delete()
    .eq("prompt_id", promptId)
    .eq("workspace_id", workspaceId)

  if (error) throw new Error(error.message)

  return true
}

export const getPromptCategories = async (client?: SupabaseClient) => {
  const { data: categories, error } = await (client || supabase)
    .from("prompt_category")
    .select("*")
    .order("name")

  if (error) {
    throw new Error(error.message)
  }

  return categories
}

export const getPublicPrompts = async (
  client?: SupabaseClient,
  search?: { category?: string; query?: string }
) => {
  const query = (client || supabase)
    .from("prompts")
    .select("*, prompt_category!inner(id, name)")
    .neq("sharing", "private")

  const { data: prompts, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  if (search?.category && !search?.query) {
    return prompts.filter(p =>
      p.prompt_category.find(
        (c: Tables<"prompt_category">) =>
          c.name.toLowerCase() === search.category?.toLowerCase()
      )
    )
  }

  if (search?.query && !search?.category) {
    return prompts.filter(
      p =>
        p.name.toLowerCase().includes(search.query?.toLowerCase()) ||
        p.description.toLowerCase().includes(search.query?.toLowerCase()) ||
        p.content.toLowerCase().includes(search.query?.toLowerCase())
    )
  }

  if (search?.query && search?.category) {
    return prompts.filter(
      p =>
        p.name.toLowerCase().includes(search.query?.toLowerCase()) ||
        p.description.toLowerCase().includes(search.query?.toLowerCase()) ||
        (p.content.toLowerCase().includes(search.query?.toLowerCase()) &&
          p.prompt_category.find(
            (c: Tables<"prompt_category">) =>
              c.name.toLowerCase() === search.category?.toLowerCase()
          ))
    )
  }

  return prompts
}
