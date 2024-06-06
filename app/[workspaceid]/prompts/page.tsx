"use client"
import { useContext } from "react"
import { ChatbotUIContext } from "@/context/context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { SidebarCreateButtons } from "@/components/sidebar2/sidebar-create-buttons"
import { SidebarDataList } from "@/components/sidebar2/sidebar-data-list"
import { useRouter } from "next/navigation"
import PageContent from "@/components/page/page-content"
import PageHeader from "@/components/page/page-header"
import PageTitle from "@/components/page/page-title"
import { Dashboard } from "@/components/ui/dashboard"
import { PromptItem } from "@/components/sidebar2/items/prompts/prompt-item"

export default function PromptsPage() {
  const { prompts: data, folders } = useContext(ChatbotUIContext)

  const filteredFolders = folders.filter(folder => folder.type === "prompts")

  return (
    <Dashboard>
      <PageContent>
        <PageHeader
          className={
            "flex w-full flex-row items-center justify-between space-y-0"
          }
        >
          <PageTitle className={"capitalize"}>Prompts</PageTitle>
          <SidebarCreateButtons
            contentType={"prompts"}
            hasData={data.length > 0}
          />
        </PageHeader>
        <SidebarDataList
          RowComponent={PromptItem}
          contentType={"prompts"}
          data={data}
          folders={filteredFolders}
        />
      </PageContent>
    </Dashboard>
  )
}