import { ModelIcon } from "@/components/models/model-icon"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { ChatbotUIContext } from "@/context/context"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import { Tables } from "@/supabase/types"
import { LLM } from "@/types"
import { IconRobotFace } from "@tabler/icons-react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { FC, useContext, useMemo, useRef } from "react"
import { DeleteChat } from "./delete-chat"
import { UpdateChat } from "./update-chat"
import { SIDEBAR_ICON_SIZE } from "@/components/sidebar2/sidebar-top-level-links"
import {
  SIDEBAR_ITEM_ICON_SIZE,
  SIDEBAR_ITEM_ICON_STROKE
} from "@/components/sidebar2/items/all/sidebar-display-item"
import { PinChat } from "@/components/sidebar2/items/chat/pin-chat"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { RowComponentType } from "@/components/sidebar2/sidebar-data-list"
import { slugify } from "@/db/lib/slugify"

interface ChatItemProps {
  chat: Tables<"chats">
}

export const ChatItem: RowComponentType = ({ item }) => {
  const {
    selectedWorkspace,
    selectedChat,
    availableLocalModels,
    assistantImages,
    availableOpenRouterModels,
    setChats
  } = useContext(ChatbotUIContext)

  const chat = item as Tables<"chats">

  const { handleNewChat } = useChatHandler()

  const router = useRouter()
  const params = useParams()
  const isActive = params.chatid === chat.id || selectedChat?.id === chat.id

  const itemRef = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    if (!selectedWorkspace) return
    return router.push(`/chat/${slugify(chat)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.stopPropagation()
      itemRef.current?.click()
    }
  }

  const MODEL_DATA = [
    ...LLM_LIST,
    ...availableLocalModels,
    ...availableOpenRouterModels
  ].find(llm => llm.modelId === chat.model) as LLM

  const assistantImage = assistantImages.find(
    image => image.assistantId === chat.assistant_id
  )?.base64

  return useMemo(
    () => (
      <div
        ref={itemRef}
        className={cn(
          "hover:bg-accent/60 focus:bg-accent group flex w-full cursor-pointer items-center rounded p-2 focus:outline-none",
          isActive && "bg-accent"
        )}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
      >
        {chat.assistant_id ? (
          assistantImage ? (
            <Image
              style={{ width: "30px", height: "30px" }}
              className="rounded"
              src={assistantImage}
              alt="Assistant image"
              width={SIDEBAR_ITEM_ICON_SIZE}
              height={SIDEBAR_ITEM_ICON_SIZE}
            />
          ) : (
            <IconRobotFace
              className="bg-primary text-secondary border-primary rounded border-[1px] p-1"
              size={SIDEBAR_ITEM_ICON_SIZE}
              stroke={SIDEBAR_ITEM_ICON_STROKE}
            />
          )
        ) : (
          <WithTooltip
            delayDuration={200}
            display={<div>{MODEL_DATA?.modelName}</div>}
            trigger={
              <ModelIcon
                provider={MODEL_DATA?.provider}
                modelId={MODEL_DATA?.modelId}
                height={SIDEBAR_ITEM_ICON_SIZE}
                width={SIDEBAR_ITEM_ICON_SIZE}
              />
            }
          />
        )}

        <div className="ml-3 flex-1 truncate text-sm">{chat.name}</div>

        <div
          onClick={e => {
            e.stopPropagation()
            e.preventDefault()
          }}
          className={`ml-2 flex space-x-2`}
        >
          <UpdateChat
            className={!isActive ? " hidden group-hover:flex" : ""}
            chat={chat}
            setChats={setChats}
          />
          <DeleteChat
            className={!isActive ? " hidden group-hover:flex" : ""}
            chat={chat}
            setChats={setChats}
            handleNewChat={handleNewChat}
          />
          <PinChat
            className={
              !isActive && !chat.pinned ? " hidden group-hover:flex" : ""
            }
            setChats={setChats}
            chat={chat}
          />
        </div>
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [chat, isActive]
  )
}
