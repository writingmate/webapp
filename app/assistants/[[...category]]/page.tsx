import { SidebarCreateButtons } from "@/components/sidebar2/sidebar-create-buttons"
import PageContent from "@/components/page/page-content"
import PageHeader from "@/components/page/page-header"
import PageTitle from "@/components/page/page-title"
import { Dashboard } from "@/components/ui/dashboard"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from "@/components/ui/card"
import { AssistantIcon } from "@/components/assistants/assistant-icon"
import Link from "next/link"
import {
  getAssistantWorkspacesByAssistantId,
  getAssistantWorkspacesByWorkspaceId,
  getPublicAssistants
} from "@/db/assistants"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Tables } from "@/supabase/types"
import {
  getHomeWorkspaceByUserId,
  getWorkspacesByUserId
} from "@/db/workspaces"
import { AssistantCategories } from "@/components/assistants/assistant-categories"
import { onlyUniqueById } from "@/lib/utils"

function Assistants({
  showCreateButton = true,
  category,
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
      <div className="grid w-full grid-cols-2 items-start justify-between gap-2">
        {data?.map(assistant => (
          <Link href={`/a/${assistant.id}`} key={assistant.id}>
            <Card className={"hover:bg-foreground/5 rounded-xl border-none"}>
              <CardContent className={"flex space-x-3 p-4"}>
                <AssistantIcon
                  className={"size-[76px] rounded-xl"}
                  assistant={assistant}
                  size={50}
                />
                <div className={"flex flex-col"}>
                  <CardTitle className={"text-md line-clamp-1"}>
                    {assistant.name}
                  </CardTitle>
                  <CardDescription className={"line-clamp-3 text-xs"}>
                    {assistant.description}
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {data.length === 0 && (
          <div className="flex h-full items-center justify-center bg-black/50 text-2xl text-white">
            No assistants found <br /> Create a new assistant to get started{" "}
          </div>
        )}
      </div>
    </PageContent>
  )
}

export default async function AssistantsPage({
  params: { category }
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
    return <Assistants showCreateButton={false} data={data} />
  }

  const workspaceId = await getHomeWorkspaceByUserId(session.user.id, supabase)
  const assistants = await getAssistantWorkspacesByWorkspaceId(
    workspaceId,
    supabase
  )

  if (!category || category?.length === 0) {
    return (
      <Assistants
        data={[...assistants.assistants, ...data].filter(onlyUniqueById)}
      />
    )
  }

  if (category[0] === "my-assistants") {
    return <Assistants data={assistants.assistants} category={category[0]} />
  }

  return <Assistants data={data} category={category[0]} />
}