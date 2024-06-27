import { ChatbotUIContext } from "@/context/context"
import { FC, useContext, useEffect } from "react"
import { AssistantPicker } from "./assistant-picker"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { FilePicker } from "./file-picker"
import { PromptPicker } from "./prompt-picker"
import { cn } from "@/lib/utils"

interface ChatCommandInputProps {}

export const ChatCommandInput: FC<ChatCommandInputProps> = ({}) => {
  const {
    newMessageFiles,
    chatFiles,
    isFilePickerOpen,
    setIsFilePickerOpen,
    hashtagCommand,
    focusFile,
    selectedAssistant,
    isPromptPickerOpen,
    isToolPickerOpen,
    isAssistantPickerOpen,
    isMessageHistoryPickerOpen,
    setIsPromptPickerOpen,
    setIsToolPickerOpen,
    setIsAssistantPickerOpen
  } = useContext(ChatbotUIContext)

  const { handleSelectUserFile, handleSelectUserCollection } =
    usePromptAndCommand()

  const isOpen =
    isPromptPickerOpen ||
    // isToolPickerOpen ||
    isAssistantPickerOpen ||
    isFilePickerOpen ||
    isMessageHistoryPickerOpen

  useEffect(() => {
    // only one picker can be open at a time
    if (isFilePickerOpen) {
      setIsPromptPickerOpen(false)
      setIsToolPickerOpen(false)
      setIsAssistantPickerOpen(false)
    }
    if (isPromptPickerOpen) {
      setIsFilePickerOpen(false)
      setIsToolPickerOpen(false)
      setIsAssistantPickerOpen(false)
    }
    if (isToolPickerOpen) {
      setIsFilePickerOpen(false)
      setIsPromptPickerOpen(false)
      setIsAssistantPickerOpen(false)
    }
    if (isAssistantPickerOpen) {
      setIsFilePickerOpen(false)
      setIsPromptPickerOpen(false)
      setIsToolPickerOpen(false)
    }
  }, [
    isFilePickerOpen,
    isPromptPickerOpen,
    isToolPickerOpen,
    isAssistantPickerOpen
  ])

  return (
    <div
      className={cn(
        "bg-background border-input left-0 max-h-[310px] w-full overflow-y-auto rounded-lg border-[1px] shadow-lg dark:border-none dark:shadow-none",
        selectedAssistant && "bottom-[100px]",
        isOpen ? "block" : "hidden"
      )}
    >
      <PromptPicker />
      <FilePicker
        isOpen={isFilePickerOpen}
        searchQuery={hashtagCommand}
        onOpenChange={setIsFilePickerOpen}
        selectedFileIds={[...newMessageFiles, ...chatFiles].map(
          file => file.id
        )}
        selectedCollectionIds={[]}
        onSelectFile={handleSelectUserFile}
        onSelectCollection={handleSelectUserCollection}
        isFocused={focusFile}
      />
      {/*<ToolPicker />*/}

      <AssistantPicker />
    </div>
  )
}
