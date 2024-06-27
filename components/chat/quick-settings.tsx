import { ChatbotUIContext } from "@/context/context"
import { getAssistantCollectionsByAssistantId } from "@/db/assistant-collections"
import { getAssistantFilesByAssistantId } from "@/db/assistant-files"
import { getAssistantToolsByAssistantId } from "@/db/assistant-tools"
import { getCollectionFilesByCollectionId } from "@/db/collection-files"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { Tables } from "@/supabase/types"
import { LLMID } from "@/types"
import { IconChevronDown, IconRobotFace } from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { ModelIcon } from "../models/model-icon"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Input } from "../ui/input"
import { QuickSettingOption } from "./quick-setting-option"
import { set } from "date-fns"
import { usePromptAndCommand } from "@/components/chat/chat-hooks/use-prompt-and-command"
import { validatePlanForAssistant } from "@/lib/subscription"
import { ChatbotUIChatContext } from "@/context/chat"

interface QuickSettingsProps {}

export const QuickSettings: FC<QuickSettingsProps> = ({}) => {
  useHotkey("p", () => setIsOpen(prevState => !prevState))

  const {
    profile,
    presets,
    assistants,
    selectedAssistant,
    selectedPreset,
    setSelectedPreset,
    setSelectedAssistant,
    assistantImages,
    setChatFiles,
    selectedWorkspace,
    setIsPaywallOpen
  } = useContext(ChatbotUIContext)

  const { chatSettings, setChatSettings, setSelectedTools } =
    useContext(ChatbotUIChatContext)

  const inputRef = useRef<HTMLInputElement>(null)

  const { handleSelectAssistant } = usePromptAndCommand()

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // FIX: hacky
    }
  }, [isOpen])

  const handleSelectQuickSetting = async (
    item: Tables<"presets"> | Tables<"assistants"> | null,
    contentType: "presets" | "assistants" | "remove"
  ) => {
    if (contentType === "assistants" && item) {
      // setSelectedAssistant(item as Tables<"assistants">)

      if (!validatePlanForAssistant(profile, item as Tables<"assistants">)) {
        setIsPaywallOpen(true)
        return
      }
      setLoading(true)
      await handleSelectAssistant(item as Tables<"assistants">)
      setLoading(false)
      setSelectedPreset(null)
    } else if (contentType === "presets" && item) {
      setSelectedPreset(item as Tables<"presets">)
      setSelectedAssistant(null)
      setChatFiles([])
      setSelectedTools([])
    } else {
      setSelectedPreset(null)
      setSelectedAssistant(null)
      setChatFiles([])
      setSelectedTools([])
      if (selectedWorkspace) {
        setChatSettings({
          model: selectedWorkspace.default_model as LLMID,
          prompt: selectedWorkspace.default_prompt,
          temperature: selectedWorkspace.default_temperature,
          contextLength: selectedWorkspace.default_context_length,
          includeProfileContext: selectedWorkspace.include_profile_context,
          includeWorkspaceInstructions:
            selectedWorkspace.include_workspace_instructions,
          embeddingsProvider: selectedWorkspace.embeddings_provider as
            | "openai"
            | "local"
        })
      }
      return
    }

    setChatSettings({
      model: item.model as LLMID,
      prompt: item.prompt,
      temperature: item.temperature,
      contextLength: item.context_length,
      includeProfileContext: item.include_profile_context,
      includeWorkspaceInstructions: item.include_workspace_instructions,
      embeddingsProvider: item.embeddings_provider as "openai" | "local"
    })
  }

  const checkIfModified = () => {
    if (!chatSettings) return false

    if (selectedPreset) {
      return (
        selectedPreset.include_profile_context !==
          chatSettings?.includeProfileContext ||
        selectedPreset.include_workspace_instructions !==
          chatSettings.includeWorkspaceInstructions ||
        selectedPreset.context_length !== chatSettings.contextLength ||
        selectedPreset.model !== chatSettings.model ||
        selectedPreset.prompt !== chatSettings.prompt ||
        selectedPreset.temperature !== chatSettings.temperature
      )
    } else if (selectedAssistant) {
      return (
        selectedAssistant.include_profile_context !==
          chatSettings.includeProfileContext ||
        selectedAssistant.include_workspace_instructions !==
          chatSettings.includeWorkspaceInstructions ||
        selectedAssistant.context_length !== chatSettings.contextLength ||
        selectedAssistant.model !== chatSettings.model ||
        selectedAssistant.prompt !== chatSettings.prompt ||
        selectedAssistant.temperature !== chatSettings.temperature
      )
    }

    return false
  }

  const isModified = checkIfModified()

  const items = [
    // ...presets.map(preset => ({ ...preset, contentType: "presets" })),
    ...assistants.map(assistant => ({
      ...assistant,
      contentType: "assistants"
    }))
  ]

  const selectedAssistantImage = selectedPreset
    ? ""
    : assistantImages.find(
        image => image.path === selectedAssistant?.image_path
      )?.url || ""

  const modelDetails = LLM_LIST.find(
    model => model.modelId === selectedPreset?.model
  )

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
        setSearch("")
      }}
    >
      <DropdownMenuTrigger asChild className="max-w-1/2" disabled={loading}>
        <Button variant="ghost" className="hidden space-x-3 text-lg sm:flex">
          {selectedPreset && (
            <ModelIcon
              provider={modelDetails?.provider || "custom"}
              modelId={modelDetails?.modelId}
              width={32}
              height={32}
            />
          )}

          {selectedAssistant &&
            (selectedAssistantImage ? (
              <Image
                className="rounded"
                src={selectedAssistantImage}
                alt="Assistant"
                width={28}
                height={28}
              />
            ) : (
              <IconRobotFace
                className="bg-primary text-secondary border-primary rounded border-[1px] p-1"
                size={28}
              />
            ))}

          {loading ? (
            <div className="animate-pulse">Loading assistant...</div>
          ) : (
            <>
              <div className="overflow-hidden text-ellipsis">
                {/*{isModified &&*/}
                {/*  (selectedPreset || selectedAssistant) &&*/}
                {/*  "Modified "}*/}

                {selectedPreset?.name ||
                  selectedAssistant?.name ||
                  "Assistants"}
              </div>

              <IconChevronDown className="ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="max-w-[calc(100vw-12px)] space-y-4 overflow-y-auto sm:min-w-[300px] sm:max-w-[500px]"
        align="start"
      >
        {presets.length === 0 && assistants.length === 0 ? (
          <div className="p-8 text-center">No items found.</div>
        ) : (
          <>
            <Input
              ref={inputRef}
              className="w-full"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.stopPropagation()}
            />

            <div className="max-h-[300px] overflow-auto">
              {!!(selectedPreset || selectedAssistant) && (
                <QuickSettingOption
                  contentType={selectedPreset ? "presets" : "assistants"}
                  isSelected={true}
                  item={
                    selectedPreset ||
                    (selectedAssistant as
                      | Tables<"presets">
                      | Tables<"assistants">)
                  }
                  onSelect={() => {
                    handleSelectQuickSetting(null, "remove")
                  }}
                  image={selectedPreset ? "" : selectedAssistantImage}
                />
              )}

              {items
                .filter(
                  item =>
                    item.name.toLowerCase().includes(search.toLowerCase()) &&
                    item.id !== selectedPreset?.id &&
                    item.id !== selectedAssistant?.id
                )
                .map(({ contentType, ...item }) => (
                  <QuickSettingOption
                    key={item.id}
                    contentType={contentType as "presets" | "assistants"}
                    isSelected={false}
                    item={item}
                    onSelect={() =>
                      handleSelectQuickSetting(
                        item,
                        contentType as "presets" | "assistants"
                      )
                    }
                    image={
                      contentType === "assistants"
                        ? assistantImages.find(
                            image =>
                              image.path ===
                              (item as Tables<"assistants">).image_path
                          )?.url || ""
                        : ""
                    }
                  />
                ))}
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
