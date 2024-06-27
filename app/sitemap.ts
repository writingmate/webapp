import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { getPublicPrompts } from "@/db/prompts"
import { slugify } from "@/db/lib/slugify"
import { getPublicAssistants } from "@/db/assistants"

export default async function sitemap() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const prompts = await getPublicPrompts(supabase)
  const assistants = await getPublicAssistants(supabase)
  const BASE_URL = process.env.BASE_URL

  const links = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily"
    },
    {
      url: `${BASE_URL}/prompts`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily"
    },
    {
      url: `${BASE_URL}/assistants`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily"
    }
  ]

  prompts.forEach(prompt => {
    links.push({
      url: `${BASE_URL}/p/${slugify(prompt)}`,
      lastModified: prompt.updated_at || prompt.created_at,
      changeFrequency: "daily"
    })
  })

  assistants.forEach(assistant => {
    links.push({
      url: `${BASE_URL}/a/${slugify(assistant)}`,
      lastModified: assistant.updated_at || assistant.created_at,
      changeFrequency: "daily"
    })
  })

  return links
}
