import { ChatbotUIContext } from "@/context/context"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { usePromptAndCommand } from "@/components/chat/chat-hooks/use-prompt-and-command"

interface MessageHistoryPickerProps {}

export const MessageHistoryPicker: FC<MessageHistoryPickerProps> = ({}) => {
  const {
    chatMessages,
    isMessageHistoryPickerOpen,
    setIsMessageHistoryPickerOpen,
    focusPrompt,
    slashCommand
  } = useContext(ChatbotUIContext)

  const { handleSelectHistoryMessage } = usePromptAndCommand()

  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (focusPrompt && itemsRef.current[0]) {
      itemsRef.current[0].focus()
    }
  }, [focusPrompt])

  const [isTyping, setIsTyping] = useState(false)

  const filteredMessages = chatMessages.filter(
    message =>
      message.message.role === "user" &&
      message.message.content.toLowerCase().includes(slashCommand.toLowerCase())
  )

  const handleOpenChange = (isOpen: boolean) => {
    setIsMessageHistoryPickerOpen(isOpen)
  }

  const getKeyDownHandler =
    (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault()
        handleOpenChange(false)
      } else if (e.key === "Enter") {
        e.preventDefault()
        handleSelectHistoryMessage(filteredMessages[index].message.content)
      } else if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        !e.shiftKey &&
        index === filteredMessages.length - 1
      ) {
        e.preventDefault()
        itemsRef.current[0]?.focus()
      } else if (e.key === "ArrowUp" && !e.shiftKey && index === 0) {
        // go to last element if arrow up is pressed on first element
        e.preventDefault()
        itemsRef.current[itemsRef.current.length - 1]?.focus()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const prevIndex =
          index - 1 >= 0 ? index - 1 : itemsRef.current.length - 1
        itemsRef.current[prevIndex]?.focus()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIndex = index + 1 < itemsRef.current.length ? index + 1 : 0
        itemsRef.current[nextIndex]?.focus()
      }
    }

  return (
    <>
      {isMessageHistoryPickerOpen && (
        <div className="flex flex-col space-y-1 p-2 text-sm">
          {filteredMessages.length === 0 ? (
            <div className="text-md flex h-14 cursor-pointer items-center justify-center italic hover:opacity-50">
              No matching prompts.
            </div>
          ) : (
            filteredMessages.map((message, index) => (
              <div
                key={message.message.id}
                ref={ref => {
                  itemsRef.current[index] = ref
                }}
                tabIndex={0}
                className="hover:bg-accent focus:bg-accent flex cursor-pointer flex-col rounded p-2 focus:outline-none"
                onClick={() =>
                  handleSelectHistoryMessage(message.message.content)
                }
                onKeyDown={getKeyDownHandler(index)}
              >
                <div className="font-semibold">{prompt.name}</div>

                <div className="truncate text-sm opacity-80">
                  {message.message.content}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  )
}
