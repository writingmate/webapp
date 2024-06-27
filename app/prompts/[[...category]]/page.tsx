import { SidebarCreateButtons } from "@/components/sidebar2/sidebar-create-buttons"
import PageContent from "@/components/page/page-content"
import PageHeader from "@/components/page/page-header"
import PageTitle from "@/components/page/page-title"
import {
  getPromptCategories,
  getPromptWorkspacesByWorkspaceId,
  getPublicPrompts
} from "@/db/prompts"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Tables } from "@/supabase/types"
import Search from "@/components/ui/search"
import {
  getHomeWorkspaceByUserId,
  getWorkspacesByUserId
} from "@/db/workspaces"
import { PromptsList } from "@/components/prompts/prompts-list"
import { PromptCategories } from "@/components/prompts/prompt-categories"

type ArrayElement<A> = A extends readonly (infer T)[] ? T : never

function getPageTitle(category?: string) {
  return !category || category === "All" ? "Prompts" : category + " Prompts"
}

export async function generateMetadata({
  params: { category }
}: {
  params: { category?: string }
}) {
  const categories = await getPromptCategories()
  const title =
    YOUR_PROMPTS ||
    categories.find(c => c.name === category)?.page_title ||
    "Prompts"
  return {
    title: `Best ${title} for Large Language Models`,
    description: `Explore ${category} prompts for large language models`
  }
}

const YOUR_PROMPTS = "Your Prompts"
export default async function PromptsPage({
  params: { category = YOUR_PROMPTS },
  searchParams: { q: query }
}: {
  params: {
    category?:
      | ArrayElement<Tables<"prompt_category">["name"]>
      | typeof YOUR_PROMPTS
    q?: string
  }
  searchParams: { q?: string }
}) {
  if (category !== undefined) {
    category = decodeURI(category) as any
  }
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const searchCategory = category === YOUR_PROMPTS ? undefined : category
  const categories = await getPromptCategories(supabase)
  categories.unshift({ id: "your-prompts", name: YOUR_PROMPTS } as any)
  const session = (await supabase.auth.getSession()).data?.session
  const isAnonymous = !session?.user
  let workspacePrompts = []
  let categoryTitle =
    YOUR_PROMPTS ||
    categories.find(c => c.name === category)?.page_title ||
    "Prompts"

  let data = []
  // If user is logged in, get their workspace prompts
  if (!isAnonymous && session?.user && category === YOUR_PROMPTS) {
    const workspaceId = await getHomeWorkspaceByUserId(
      session?.user.id,
      supabase
    )
    workspacePrompts = (
      await getPromptWorkspacesByWorkspaceId(
        workspaceId,
        {
          category: searchCategory,
          query
        },
        supabase
      )
    ).prompts
    data = workspacePrompts
  } else {
    data = await getPublicPrompts(supabase, {
      category: searchCategory,
      query
    })
  }

  return (
    <PageContent className={"container h-full justify-start"}>
      <PageHeader
        className={
          "flex w-full flex-row items-center justify-between space-y-0"
        }
      >
        <PageTitle className={"capitalize"}>{categoryTitle}</PageTitle>
        <div className={"flex space-x-2"}>
          {
            <SidebarCreateButtons
              contentType={"prompts"}
              hasData={data?.length > 0}
            />
          }
        </div>
      </PageHeader>
      <Search
        className={"w-full rounded-lg"}
        placeholder={"Search prompts..."}
      />
      <PromptCategories categories={categories} selected={category} />
      <PromptsList prompts={data} />
    </PageContent>
  )
}
