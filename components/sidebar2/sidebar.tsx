import { ChatbotUIContext } from "@/context/context"
import { ContentType } from "@/types"
import { FC, useContext, useState } from "react"
import { WorkspaceSwitcher } from "../utility/workspace-switcher"
import { WorkspaceSettings } from "../workspace/workspace-settings"
import { validateProPlan } from "@/lib/subscription"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { IconDiamondFilled } from "@tabler/icons-react"
import { ProfileSettings } from "@/components/utility/profile-settings"
import { SidebarTopContent } from "@/components/sidebar2/sidebar-top-content"
import { SidebarDataList } from "@/components/sidebar2/sidebar-data-list"
import { ChatItem } from "@/components/sidebar2/items/chat/chat-item"

interface SidebarProps {
  contentType: ContentType
  onContentTypeChange: (contentType: ContentType) => void
  showSidebar: boolean
}

export const Sidebar2: FC<SidebarProps> = ({
  contentType,
  onContentTypeChange
}) => {
  const { folders, chats, profile, setIsPaywallOpen, workspaces } =
    useContext(ChatbotUIContext)

  const [searchTerm, setSearchTerm] = useState("")
  const chatFolders = folders.filter(folder => folder.type === "chats")
  const filteredChats = chats.filter(
    chat => chat.name.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
  )
  return (
    <div className="m-0 w-full space-y-2">
      <div className="flex h-screen flex-col p-3 pb-2">
        {workspaces?.length > 1 && (
          <div className="flex items-center border-b pb-2">
            <WorkspaceSwitcher />
            <WorkspaceSettings />
          </div>
        )}
        <div className="flex grow flex-col overflow-auto">
          <SidebarTopContent
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            contentType={contentType}
            onContentTypeChange={onContentTypeChange}
          />
          <SidebarDataList
            RowComponent={ChatItem}
            contentType={"chats"}
            data={filteredChats}
            folders={chatFolders}
          />
        </div>

        <div className="flex w-full flex-col space-y-2">
          {!validateProPlan(profile) && (
            <div
              onClick={() => setIsPaywallOpen(true)}
              className={"hover:bg-accent/60 cursor-pointer rounded-md p-2"}
            >
              <div
                className={
                  "text-md flex items-center font-semibold text-violet-700"
                }
              >
                <IconDiamondFilled
                  className="mr-2 cursor-pointer"
                  stroke={1.5}
                  size={24}
                />{" "}
                Try Pro
              </div>
              <div className={"text-muted-foreground text-sm"}>
                Upgrade to paid plan to get access to all features.
              </div>
            </div>
          )}

          <WithTooltip
            display={<div>Profile Settings</div>}
            trigger={<ProfileSettings />}
          />
        </div>
      </div>
    </div>
  )
}
