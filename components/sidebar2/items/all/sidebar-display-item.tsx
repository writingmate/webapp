import { ChatbotUIContext } from "@/context/context"
import { createChat } from "@/db/chats"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { ContentType, DataItemType, LLMID } from "@/types"
import { useRouter } from "next/navigation"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { SidebarUpdateItem } from "./sidebar-update-item"
import {
  IconEdit,
  IconLock,
  IconLockAccess,
  IconSquarePlus
} from "@tabler/icons-react"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { unique } from "next/dist/build/utils"
import { usePromptAndCommand } from "@/components/chat/chat-hooks/use-prompt-and-command"
import {
  validatePlanForAssistant,
  validatePlanForTools
} from "@/lib/subscription"

interface SidebarItemProps {
  item: DataItemType
  isTyping: boolean
  contentType: ContentType
  icon: React.ReactNode
  updateState: any
  renderInputs: (renderState: any) => JSX.Element
  name?: string
}

export const SIDEBAR_ITEM_ICON_SIZE = 24
export const SIDEBAR_ITEM_ICON_STROKE = 1.5

export const SidebarItem: FC<SidebarItemProps> = ({
  item,
  contentType,
  updateState,
  renderInputs,
  icon,
  isTyping,
  name
}) => {
  const {
    selectedWorkspace,
    profile,
    selectedAssistant,
    selectedTools,
    chatFiles,
    newMessageFiles,
    setIsPaywallOpen
  } = useContext(ChatbotUIContext)

  const router = useRouter()

  const itemRef = useRef<HTMLDivElement>(null)

  const {
    handleSelectPromptWithVariables,
    handleSelectAssistant,
    handleSelectTool,
    handleSelectUserFile
  } = usePromptAndCommand()

  const [isHovering, setIsHovering] = useState(false)

  const isActiveMap = {
    chats: (item: any) => {
      return false
    },
    presets: (item: any) => {
      return false
    },
    prompts: (item: any) => {
      return false
    },
    files: (item: any) => {
      return (
        chatFiles?.some(file => file.id === item.id) ||
        newMessageFiles.some(file => file.id === item.id)
      )
    },
    collections: (item: any) => {
      return false
    },
    assistants: (assistant: any) => {
      return selectedAssistant?.id === assistant?.id
    },
    tools: (item: any) => {
      return selectedTools?.includes(item)
    },
    models: (item: any) => {
      return false
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation()
      itemRef.current?.click()
    }
  }

  const readOnly =
    item.sharing == "platform" ||
    (item.sharing === "public" && item.user_id !== profile?.user_id)

  return (
    <div
      ref={itemRef}
      className={cn(
        "group flex w-full cursor-pointer items-center p-2 focus:outline-none",
        isActiveMap[contentType]?.(item) && "bg-accent"
      )}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {readOnly ? (
        <>
          {icon}
          <div className="ml-3 flex-1 justify-items-center truncate text-sm">
            {item.name}
          </div>
        </>
      ) : (
        <SidebarUpdateItem
          name={name}
          item={item}
          isActive={false}
          isHovering={isHovering}
          isTyping={isTyping}
          contentType={contentType}
          updateState={updateState}
          renderInputs={renderInputs}
        >
          {icon}
          <div className="ml-3 flex-1 justify-items-center truncate text-sm">
            {item.name}
          </div>
        </SidebarUpdateItem>
      )}
    </div>
  )
}
