import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import {
  IconArrowUp,
  IconBrush,
  IconClearAll,
  IconPaperclip,
  IconPlayerStopFilled,
  IconPlaylistX,
  IconRepeat,
  IconSend,
  IconX
} from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Input } from "../ui/input"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { toast } from "sonner"
import { useSelectFileHandler } from "@/components/splitview/splitview-hooks/use-select-file-handler"
import { ChatFilesDisplay } from "@/components/chat/chat-files-display"
import { PromptCatalog } from "@/components/splitview/prompt-catalog"

interface ChatInputProps {
  isGenerating: boolean
  // userInput: string
  // setUserInput: (input: string) => void,
  handleSendMessage: (input: string, isRegeneration: boolean) => void
  handleStopMessage: () => void
  handleReset: () => void
  hasMessages: boolean
  imagesAllowed?: boolean
  toolsAllowed?: boolean
}

export const ChatInput: FC<ChatInputProps> = ({
  isGenerating,
  hasMessages,
  handleSendMessage,
  handleStopMessage,
  imagesAllowed,
  toolsAllowed,
  handleReset
}) => {
  // useHotkey("l", () => {
  //   handleFocusChatInput()
  // })

  const [isTyping, setIsTyping] = useState<boolean>(false)

  const {
    setIsPromptPickerOpen,
    selectedTools,
    setSelectedTools,
    profile,
    userInput,
    setUserInput
  } = useContext(ChatbotUIContext)

  // const {
  //   chatInputRef,
  //   // handleSendMessage,
  //   // handleStopMessage,
  //   // handleFocusChatInput
  // } = useChatHandler()

  // const { handleInputChange } = usePromptAndCommand()

  const { filesToAccept, handleSelectDeviceFile, isUploading } =
    useSelectFileHandler({
      imagesAllowed
    })

  // const {
  //   setNewMessageContentToNextUserMessage,
  //   setNewMessageContentToPreviousUserMessage
  // } = useChatHistoryHandler()

  const fileInputRef = useRef<HTMLInputElement>(null)

  // useEffect(() => {
  //   setTimeout(() => {
  //     handleFocusChatInput()
  //   }, 200) // FIX: hacky
  // }, [selectedPreset, selectedAssistant])

  function isSendShortcut(event: React.KeyboardEvent) {
    if (isGenerating) {
      return false
    }
    let shortcutPressed = event.key === "Enter" && !event.shiftKey
    if (profile?.send_message_on_enter === false) {
      shortcutPressed =
        event.key === "Enter" && (event.ctrlKey || event.metaKey)
    }
    return shortcutPressed
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isTyping && isSendShortcut(event)) {
      event.preventDefault()
      setIsPromptPickerOpen(false)
      handleSendMessage(userInput, false)
    }
    //
    // // Consolidate conditions to avoid TypeScript error
    // if (
    //   isPromptPickerOpen ||
    //   isFilePickerOpen ||
    //   isToolPickerOpen ||
    //   isAssistantPickerOpen
    // ) {
    //   if (
    //     event.key === "Tab" ||
    //     event.key === "ArrowUp" ||
    //     event.key === "ArrowDown"
    //   ) {
    //     event.preventDefault()
    //     // Toggle focus based on picker type
    //     if (isPromptPickerOpen) setFocusPrompt(!focusPrompt)
    //     if (isFilePickerOpen) setFocusFile(!focusFile)
    //     if (isToolPickerOpen) setFocusTool(!focusTool)
    //     if (isAssistantPickerOpen) setFocusAssistant(!focusAssistant)
    //   }
    // }
    //
    // if (event.key === "ArrowUp" && event.shiftKey && event.ctrlKey) {
    //   event.preventDefault()
    //   setNewMessageContentToPreviousUserMessage()
    // }
    //
    // if (event.key === "ArrowDown" && event.shiftKey && event.ctrlKey) {
    //   event.preventDefault()
    //   setNewMessageContentToNextUserMessage()
    // }
    //
    // //use shift+ctrl+up and shift+ctrl+down to navigate through chat history
    // if (event.key === "ArrowUp" && event.shiftKey && event.ctrlKey) {
    //   event.preventDefault()
    //   setNewMessageContentToPreviousUserMessage()
    // }
    //
    // if (event.key === "ArrowDown" && event.shiftKey && event.ctrlKey) {
    //   event.preventDefault()
    //   setNewMessageContentToNextUserMessage()
    // }
    //
    // if (
    //   isAssistantPickerOpen &&
    //   (event.key === "Tab" ||
    //     event.key === "ArrowUp" ||
    //     event.key === "ArrowDown")
    // ) {
    //   event.preventDefault()
    //   setFocusAssistant(!focusAssistant)
    // }
  }

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items
    for (const item of items) {
      if (item.type.indexOf("image") === 0) {
        if (!imagesAllowed) {
          toast.error(
            `Images are not supported for this model. Use models like GPT-4 Vision instead.`
          )
          return
        }
        const file = item.getAsFile()
        if (!file) return
        handleSelectDeviceFile(file)
      }
    }
  }

  return (
    <>
      <ChatFilesDisplay />
      <div className={"relative"}>
        {/*<ChatCommandInput/>*/}
        <div className="border-input my-3 flex min-h-[60px] w-full flex-col justify-end overflow-hidden rounded-xl border backdrop-blur-xl">
          {/*{selectedAssistant && (*/}
          {/*  <div className="bg-secondary flex items-center justify-between space-x-2 p-2 pl-4 pr-3">*/}
          {/*    <div className={"flex items-center space-x-2"}>*/}
          {/*      <AssistantIcon assistant={selectedAssistant} size={24}/>*/}
          {/*      <div className="text-sm font-semibold">*/}
          {/*        Talking to {selectedAssistant.name}*/}
          {/*      </div>*/}
          {/*    </div>*/}

          {/*    <IconX*/}
          {/*      onClick={() => setSelectedAssistant(null)}*/}
          {/*      className={*/}
          {/*        "hover:text-foreground/50 flex size-4 cursor-pointer items-center justify-center text-[10px]"*/}
          {/*      }*/}
          {/*    />*/}
          {/*  </div>*/}
          {/*)}*/}

          <div className={"relative my-2 flex items-center justify-center"}>
            <div className={"absolute left-3 flex items-center space-x-1"}>
              <IconPaperclip
                className="cursor-pointer p-1 hover:opacity-50"
                size={32}
                onClick={() => fileInputRef.current?.click()}
              />
              <PromptCatalog onSelect={setUserInput} />
              {/*{toolsAllowed && (*/}
              {/*  <ToolSelect*/}
              {/*    className={"px-0"}*/}
              {/*    selectedTools={selectedTools}*/}
              {/*    onSelectTools={setSelectedTools}*/}
              {/*  />*/}
              {/*)}*/}
            </div>

            {/* Hidden input to select files from device */}
            <Input
              ref={fileInputRef}
              className="hidden"
              type="file"
              onChange={e => {
                if (!e.target.files) return
                handleSelectDeviceFile(e.target.files[0])
              }}
              accept={filesToAccept}
            />

            <TextareaAutosize
              // textareaRef={chatInputRef}
              className={cn(
                "ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring text-md flex w-full resize-none rounded-md border-none bg-transparent px-14 py-2 pl-20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                toolsAllowed && "pl-32"
              )}
              placeholder={
                `Ask anything. `
                // Type "${profile?.assistant_command}" for assistants, "${profile?.prompt_command}" for prompts, "${profile?.files_command}" for files, and "${profile?.tools_command}" for plugins.`
              }
              onValueChange={setUserInput}
              value={userInput}
              minRows={1}
              maxRows={18}
              onKeyDown={handleKeyDown}
              // onPaste={handlePaste}
              onCompositionStart={() => setIsTyping(true)}
              onCompositionEnd={() => setIsTyping(false)}
            />

            <div className="absolute bottom-1.5 right-3 flex cursor-pointer items-center space-x-2">
              {!isGenerating && hasMessages && (
                <IconPlaylistX
                  className={"cursor-pointer hover:opacity-50"}
                  onClick={handleReset}
                  stroke={1.5}
                  size={24}
                />
              )}
              {isGenerating ? (
                <IconPlayerStopFilled
                  className="animate-pulse cursor-pointer rounded bg-transparent p-1 hover:opacity-50"
                  onClick={handleStopMessage}
                  size={30}
                />
              ) : (
                <IconArrowUp
                  className={cn(
                    "bg-primary text-secondary rounded-lg p-1",
                    !userInput && "opacity-md cursor-not-allowed"
                  )}
                  onClick={() => {
                    if (!userInput) return
                    handleSendMessage(userInput, false)
                  }}
                  size={30}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
