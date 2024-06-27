"use client"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
import { ChatbotUIContext } from "@/context/context"
import { createFolder } from "@/db/folders"
import { ContentType } from "@/types"
import {
  IconFolderPlus,
  IconMessage2,
  IconMessageChatbot,
  IconPencil,
  IconPlus,
  IconSearch,
  IconWritingSign,
  IconX
} from "@tabler/icons-react"
import { FC, useContext, useState } from "react"
import { Button } from "../ui/button"
import { CreateAssistant } from "./items/assistants/create-assistant"
import { CreateCollection } from "./items/collections/create-collection"
import { CreateFile } from "./items/files/create-file"
import { CreateModel } from "./items/models/create-model"
import { CreatePreset } from "./items/presets/create-preset"
import { CreatePrompt } from "./items/prompts/create-prompt"
import { CreateTool } from "./items/tools/create-tool"
import { isMobileScreen } from "@/lib/mobile"
import { SIDEBAR_ICON_SIZE } from "@/components/sidebar2/sidebar-top-level-links"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SidebarCreateButtonsProps {
  contentType: ContentType
  hasData: boolean
  name?: string
}

export const SidebarCreateButtons: FC<SidebarCreateButtonsProps> = ({
  name,
  contentType,
  hasData
}) => {
  const { setShowSidebar, profile, selectedWorkspace, folders, setFolders } =
    useContext(ChatbotUIContext)
  const { handleNewChat } = useChatHandler()

  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false)
  const [isCreatingPreset, setIsCreatingPreset] = useState(false)
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [isCreatingCollection, setIsCreatingCollection] = useState(false)
  const [isCreatingAssistant, setIsCreatingAssistant] = useState(false)
  const [isCreatingTool, setIsCreatingTool] = useState(false)
  const [isCreatingModel, setIsCreatingModel] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

  const handleCreateFolder = async () => {
    if (!profile) return
    if (!selectedWorkspace) return

    const createdFolder = await createFolder({
      user_id: profile.user_id,
      workspace_id: selectedWorkspace.id,
      name: "New Folder",
      description: "",
      type: contentType
    })
    setFolders([...folders, createdFolder])
  }

  const resolvedName = name || contentType

  const getCreateFunction = () => {
    switch (contentType) {
      case "chats":
        return async () => {}

      case "presets":
        return async () => {
          setIsCreatingPreset(true)
        }

      case "prompts":
        return async () => {
          setIsCreatingPrompt(true)
        }

      case "files":
        return async () => {
          setIsCreatingFile(true)
        }

      case "collections":
        return async () => {
          setIsCreatingCollection(true)
        }

      case "assistants":
        return async () => {
          setIsCreatingAssistant(true)
        }

      case "tools":
        return async () => {
          setIsCreatingTool(true)
        }

      case "models":
        return async () => {
          setIsCreatingModel(true)
        }

      default:
        break
    }
  }

  if (!profile) return null

  return (
    <div className={"flex flex-nowrap space-x-1"}>
      <Button
        size={"xs"}
        variant={"outline"}
        className="flex justify-start p-1 px-2 py-0"
        onClick={getCreateFunction()}
      >
        <IconPlus stroke={1.5} size={SIDEBAR_ICON_SIZE} />
        <div className="ml-2">
          Create{" "}
          {resolvedName.charAt(0).toUpperCase() +
            resolvedName.slice(1, resolvedName.length - 1)}
        </div>
      </Button>

      {/*{hasData && (*/}
      {/*  <Button*/}
      {/*    size={"xs"}*/}
      {/*    variant={"outline"}*/}
      {/*    className="flex p-1 px-2 py-0"*/}
      {/*    onClick={handleCreateFolder}*/}
      {/*  >*/}
      {/*    <IconFolderPlus stroke={1.5} size={SIDEBAR_ICON_SIZE} />*/}
      {/*  </Button>*/}
      {/*)}*/}

      {isCreatingPrompt && (
        <CreatePrompt
          isOpen={isCreatingPrompt}
          onOpenChange={setIsCreatingPrompt}
        />
      )}

      {isCreatingPreset && (
        <CreatePreset
          isOpen={isCreatingPreset}
          onOpenChange={setIsCreatingPreset}
        />
      )}

      {isCreatingFile && (
        <CreateFile isOpen={isCreatingFile} onOpenChange={setIsCreatingFile} />
      )}

      {isCreatingCollection && (
        <CreateCollection
          isOpen={isCreatingCollection}
          onOpenChange={setIsCreatingCollection}
        />
      )}

      {isCreatingAssistant && (
        <CreateAssistant
          isOpen={isCreatingAssistant}
          onOpenChange={setIsCreatingAssistant}
        />
      )}

      {isCreatingTool && (
        <CreateTool isOpen={isCreatingTool} onOpenChange={setIsCreatingTool} />
      )}

      {isCreatingModel && (
        <CreateModel
          isOpen={isCreatingModel}
          onOpenChange={setIsCreatingModel}
        />
      )}
    </div>
  )
}
