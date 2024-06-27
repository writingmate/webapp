import { SidebarCreateButtons } from "@/components/sidebar2/sidebar-create-buttons"
import PageContent from "@/components/page/page-content"
import PageHeader from "@/components/page/page-header"
import PageTitle from "@/components/page/page-title"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from "@/components/ui/card"
import { AssistantIcon } from "@/components/assistants/assistant-icon"
import Link from "next/link"
import {
  getAssistantWorkspacesByWorkspaceId,
  getPublicAssistants
} from "@/db/assistants"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Tables } from "@/supabase/types"
import { getHomeWorkspaceByUserId } from "@/db/workspaces"
import { AssistantCategories } from "@/components/assistants/assistant-categories"
import { onlyUniqueById } from "@/lib/utils"
import { SharingIcon } from "@/components/sharing/sharing-icon"
import { slugify } from "@/db/lib/slugify"

function Assistants({
  showCreateButton = true,
  category = "community",
  data
}: {
  showCreateButton?: boolean
  data: Tables<"assistants">[]
  category?: string
}) {
  let pageTitle =
    category === "my-assistants" ? "My Assistants" : "Community Assistants"

  if (!category) {
    pageTitle = "All Assistants"
  }

  return (
    <PageContent className={"container h-full justify-start pb-5"}>
      <PageHeader
        className={
          "flex w-full flex-row items-center justify-between space-y-0"
        }
      >
        <PageTitle className={"capitalize"}>{pageTitle}</PageTitle>
        {showCreateButton && (
          <SidebarCreateButtons
            contentType={"assistants"}
            hasData={data?.length > 0}
          />
        )}
      </PageHeader>
      <AssistantCategories
        selected={category}
        categories={[
          {
            name: "My Assistants",
            value: "my-assistants"
          },
          {
            name: "Community Assistants",
            value: "community"
          }
        ]}
      />
      {data?.length > 0 && (
        <div className="grid w-full grid-cols-2 items-start justify-between gap-3 pb-6 lg:grid-cols-3">
          {data?.map(assistant => (
            <Link href={`/a/${slugify(assistant)}`} key={assistant.id}>
              <Card
                className={
                  "hover:bg-foreground/5 border-input rounded-xl border shadow-none"
                }
              >
                <CardContent className={"relative flex space-x-3 p-4"}>
                  <AssistantIcon
                    className={"size-[50px] rounded-md"}
                    assistant={assistant}
                    size={36}
                  />
                  <div className={"flex flex-col"}>
                    <CardTitle className={"text-md line-clamp-1"}>
                      {assistant.name}
                    </CardTitle>
                    <CardDescription className={"line-clamp-2 text-xs"}>
                      {assistant.description}
                    </CardDescription>
                  </div>
                  <SharingIcon item={assistant as any} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      {data.length === 0 && (
        <div className="flex h-full items-center justify-center text-center text-2xl">
          No assistants found <br /> Create a new assistant to get started{" "}
        </div>
      )}
    </PageContent>
  )
}

export default async function AssistantsPage({
  params: { category = ["community"] }
}: {
  params: {
    category?: string[]
  }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const data = await getPublicAssistants(supabase)

  const session = (await supabase.auth.getSession()).data.session

  if (!session) {
    return (
      <Assistants
        showCreateButton={false}
        data={data.sort((a, b) => (a.sharing === "private" ? -1 : 1))}
      />
    )
  }

  const workspaceId = await getHomeWorkspaceByUserId(session.user.id, supabase)
  const assistants = await getAssistantWorkspacesByWorkspaceId(
    workspaceId,
    supabase
  )

  if (!category || category?.length === 0) {
    return (
      <Assistants
        data={[...assistants.assistants, ...data]
          .filter(onlyUniqueById)
          .sort((a, b) => (a.sharing === "private" ? -1 : 1))}
      />
    )
  }

  if (category[0] === "my-assistants") {
    return (
      <Assistants
        data={assistants.assistants.sort((a, b) =>
          a.sharing === "private" ? -1 : 1
        )}
        category={category[0]}
      />
    )
  }

  return (
    <Assistants
      data={data.sort((a, b) => (a.sharing === "private" ? -1 : 1))}
      category={category[0]}
    />
  )
}
