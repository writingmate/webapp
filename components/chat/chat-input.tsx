import { ChatbotUIContext } from "@/context/context"
import useHotkey from "@/lib/hooks/use-hotkey"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { cn } from "@/lib/utils"
import {
  IconPaperclip,
  IconPlayerStopFilled,
  IconX,
  IconMicrophone,
  IconPlayerRecordFilled,
  IconArrowUp,
  IconPrompt,
  IconPlus,
  IconTerminal2
} from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Input } from "../ui/input"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { ChatCommandInput } from "./chat-command-input"
import { ChatFilesDisplay } from "./chat-files-display"
import { useChatHandler } from "./chat-hooks/use-chat-handler"
import { useChatHistoryHandler } from "./chat-hooks/use-chat-history"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { useSelectFileHandler } from "./chat-hooks/use-select-file-handler"
import { toast } from "sonner"
import { AssistantIcon } from "@/components/assistants/assistant-icon"
import { ChatbotUIChatContext } from "@/context/chat"
import Lib from "@apidevtools/json-schema-ref-parser/lib"
import Link from "next/link"

interface ChatInputProps {
  showAssistant: boolean
}

export const ChatInput: FC<ChatInputProps> = ({ showAssistant = true }) => {
  useHotkey("l", () => {
    handleFocusChatInput()
  })

  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [userInputBeforeRecording, setUserInputBeforeRecording] = useState("")
  const [transcript, setTranscript] = useState<string>("")
  const [recognition, setRecognition] = useState<any>(null)
  const [listening, setListening] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>()

  const {
    isAssistantPickerOpen,
    focusAssistant,
    setFocusAssistant,
    selectedPreset,
    selectedAssistant,
    setSelectedAssistant,
    focusPrompt,
    setFocusPrompt,
    focusFile,
    focusTool,
    setFocusTool,
    isToolPickerOpen,
    isPromptPickerOpen,
    setIsFilePickerOpen,
    setIsPromptPickerOpen,
    isFilePickerOpen,
    setFocusFile,
    profile,
    selectedWorkspace
  } = useContext(ChatbotUIContext)

  const { userInput, setUserInput, chatMessages, isGenerating, chatSettings } =
    useContext(ChatbotUIChatContext)

  const {
    chatInputRef,
    handleSendMessage,
    handleStopMessage,
    handleFocusChatInput
  } = useChatHandler()

  const { handleInputChange } = usePromptAndCommand()

  const { filesToAccept, handleSelectDeviceFile, isUploading } =
    useSelectFileHandler()

  const {
    setNewMessageContentToNextUserMessage,
    setNewMessageContentToPreviousUserMessage
  } = useChatHistoryHandler()

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        const array: SpeechRecognitionResult[] = Array.from(event.results)
        const transcript = array
          .map((result: SpeechRecognitionResult) => result[0].transcript)
          .join("")
        setTranscript(transcript)
        // Check for silence
        const isSilent = transcript.trim() === ""
        if (isSilent) {
          // Reset and set a new timeout to stop the recognition after 30 seconds of silence
          if (timeoutId) clearTimeout(timeoutId)
          setTimeoutId(
            setTimeout(() => {
              setTranscript("")
              if (recognition) recognition.stop()
            }, 30 * 1000)
          ) // 30 seconds
        } else {
          // Reset the timeout if the user is speaking
          if (timeoutId) clearTimeout(timeoutId)
        }
      }

      recognition.onend = (event: any) => {
        setListening(false)
        if (event.error === "no-speech") {
          startListening()
        } else if (transcript.trim() !== "") {
          // Restart the recognition if the user is still speaking
          startListening()
        }
      }

      setRecognition(recognition)
    }
    setTimeout(() => {
      handleFocusChatInput()
    }, 200) // FIX: hacky
  }, [selectedPreset, selectedAssistant])

  useEffect(() => {
    if (listening) {
      setUserInput((userInputBeforeRecording + " " + transcript).trim())
    } else {
      setUserInputBeforeRecording(userInput)
    }
  }, [listening, transcript, userInputBeforeRecording])

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
    if (!isTyping && isSendShortcut(event) && !isUploading) {
      event.preventDefault()
      setIsPromptPickerOpen(false)
      handleSendMessage(userInput, chatMessages, false)
    }

    // Consolidate conditions to avoid TypeScript error
    if (
      isPromptPickerOpen ||
      isFilePickerOpen ||
      isToolPickerOpen ||
      isAssistantPickerOpen
    ) {
      if (
        event.key === "Tab" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown"
      ) {
        event.preventDefault()
        // Toggle focus based on picker type
        if (isPromptPickerOpen) setFocusPrompt(!focusPrompt)
        if (isFilePickerOpen) setFocusFile(!focusFile)
        if (isToolPickerOpen) setFocusTool(!focusTool)
        if (isAssistantPickerOpen) setFocusAssistant(!focusAssistant)
      }
    }

    if (event.key === "ArrowUp" && event.shiftKey && event.ctrlKey) {
      event.preventDefault()
      setNewMessageContentToPreviousUserMessage()
    }

    if (event.key === "ArrowDown" && event.shiftKey && event.ctrlKey) {
      event.preventDefault()
      setNewMessageContentToNextUserMessage()
    }

    //use shift+ctrl+up and shift+ctrl+down to navigate through chat history
    if (event.key === "ArrowUp" && event.shiftKey && event.ctrlKey) {
      event.preventDefault()
      setNewMessageContentToPreviousUserMessage()
    }

    if (event.key === "ArrowDown" && event.shiftKey && event.ctrlKey) {
      event.preventDefault()
      setNewMessageContentToNextUserMessage()
    }

    if (
      isAssistantPickerOpen &&
      (event.key === "Tab" ||
        event.key === "ArrowUp" ||
        event.key === "ArrowDown")
    ) {
      event.preventDefault()
      setFocusAssistant(!focusAssistant)
    }
  }

  const handlePaste = (event: React.ClipboardEvent) => {
    const imagesAllowed = LLM_LIST.find(
      llm => llm.modelId === chatSettings?.model
    )?.imageInput

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
  const startListening = () => {
    if (recognition) {
      setListening(true)
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition) {
      if (timeoutId) clearTimeout(timeoutId)
      recognition.stop()
      setTranscript("")
      setListening(false)
    }
  }

  // Function to manually restart the recognition
  const restartListening = () => {
    if (!listening) {
      startListening()
    }
  }

  return (
    <>
      <div className="flex flex-col flex-wrap justify-center gap-2">
        <ChatFilesDisplay />
      </div>

      <div className={"relative"}>
        <ChatCommandInput />
        <div className="border-input mt-3 flex w-full flex-col justify-end overflow-hidden rounded-xl border backdrop-blur-xl">
          {showAssistant && selectedAssistant && (
            <div className="bg-accent border-input flex items-center justify-between space-x-2 border-b p-2 pl-4 pr-3">
              <div className={"flex items-center space-x-2"}>
                <AssistantIcon assistant={selectedAssistant} size={24} />
                <div className="text-sm font-semibold">
                  Talking to {selectedAssistant.name}
                </div>
              </div>

              <IconX
                stroke={1.5}
                onClick={() => setSelectedAssistant(null)}
                className={
                  "hover:text-foreground/50 flex size-4 cursor-pointer items-center justify-center text-[10px]"
                }
              />
            </div>
          )}
          <div className="flex items-end justify-between p-2">
            <div className={"flex"}>
              <div title={"Upload/attach files"}>
                <IconPlus
                  onClick={() =>
                    setIsFilePickerOpen(isFilePickerOpen => !isFilePickerOpen)
                  }
                  stroke={1.5}
                  className="m-1 cursor-pointer p-0.5 hover:opacity-50"
                  size={24}
                />
              </div>
              <div title={"Select prompt from a library"}>
                <IconTerminal2
                  onClick={() =>
                    setIsPromptPickerOpen(
                      isPromptPickerOpen => !isPromptPickerOpen
                    )
                  }
                  stroke={1.5}
                  className={cn(
                    "m-1 cursor-pointer p-0.5 hover:opacity-50",
                    userInput &&
                      "invisible -ml-7 transition-[margin] duration-200"
                  )}
                  size={24}
                />
              </div>
            </div>
            <TextareaAutosize
              textareaRef={chatInputRef}
              className="ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full resize-none rounded-md border-none bg-transparent p-1.5 px-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={`Ask anything...`}
              onValueChange={handleInputChange}
              value={userInput}
              minRows={1}
              maxRows={18}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onCompositionStart={() => setIsTyping(true)}
              onCompositionEnd={() => setIsTyping(false)}
            />
            <div className="flex cursor-pointer justify-end">
              <div className={"flex flex-nowrap overflow-hidden"}>
                {recognition && (
                  <button
                    onClick={listening ? stopListening : restartListening}
                  >
                    {listening ? (
                      <IconPlayerRecordFilled
                        stroke={1.5}
                        className={"animate-pulse text-red-500"}
                        size={24}
                      />
                    ) : (
                      <IconMicrophone
                        className={"m-1 cursor-pointer p-0.5 hover:opacity-50"}
                        stroke={1.5}
                        size={24}
                      />
                    )}
                  </button>
                )}
                {isGenerating ? (
                  <IconPlayerStopFilled
                    className="hover:bg-background m-1 animate-pulse rounded bg-transparent p-0.5 hover:opacity-50"
                    onClick={handleStopMessage}
                    stroke={1.5}
                    size={24}
                  />
                ) : (
                  <IconArrowUp
                    className={cn(
                      "bg-primary text-secondary m-1 rounded-lg p-0.5 hover:opacity-50",
                      (!userInput || isUploading) &&
                        "cursor-not-allowed opacity-50"
                    )}
                    onClick={() => {
                      if (!userInput || isUploading) return
                      handleSendMessage(userInput, chatMessages, false)
                    }}
                    stroke={1.5}
                    size={24}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
