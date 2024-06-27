import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { IconBolt, IconPuzzle } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef } from "react"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { validatePlanForTools } from "@/lib/subscription"
import profile from "react-syntax-highlighter/dist/esm/languages/hljs/profile"
import { LLM_LIST, LLM_LIST_MAP } from "@/lib/models/llm/llm-list"
import { ChatbotUIChatContext } from "@/context/chat"

interface ToolPickerProps {}

export const ToolPicker: FC<ToolPickerProps> = ({}) => {
  const {
    tools,
    platformTools,
    focusTool,
    toolCommand,
    isToolPickerOpen,
    setIsToolPickerOpen,
    setIsPaywallOpen
  } = useContext(ChatbotUIContext)

  const { chatSettings } = useContext(ChatbotUIChatContext)

  const { handleSelectTool } = usePromptAndCommand()

  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (focusTool && itemsRef.current[0]) {
      itemsRef.current[0].focus()
    }
  }, [focusTool])

  const allTools = [...tools]

  const filteredTools = allTools.filter(tool =>
    tool.name.toLowerCase().includes(toolCommand.toLowerCase())
  )

  const handleOpenChange = (isOpen: boolean) => {
    setIsToolPickerOpen(isOpen)
  }

  const callSelectTool = (tool: Tables<"tools">) => {
    if (validatePlanForTools(profile, [tool])) {
      setIsPaywallOpen(true)
      return
    }
    handleSelectTool(tool)
    handleOpenChange(false)
  }

  const getKeyDownHandler =
    (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault()
        handleOpenChange(false)
      } else if (e.key === "Enter") {
        e.preventDefault()
        callSelectTool(filteredTools[index])
      } else if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        !e.shiftKey &&
        index === filteredTools.length - 1
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

  const toolsSupported = LLM_LIST.find(
    llm => llm.modelId === chatSettings?.model
  )?.tools

  return (
    <>
      {isToolPickerOpen && (
        <div className="bg-background flex flex-col space-y-1 rounded-xl border p-2 text-sm">
          {!toolsSupported ? (
            <div className="text-md flex h-14 cursor-pointer items-center justify-center italic hover:opacity-50">
              This model does not support plugins. Select a different model.
            </div>
          ) : filteredTools.length === 0 ? (
            <div className="text-md flex h-14 cursor-pointer items-center justify-center italic hover:opacity-50">
              No matching tools.
            </div>
          ) : (
            <>
              {filteredTools.map((item, index) => (
                <div
                  key={item.id}
                  ref={ref => {
                    itemsRef.current[index] = ref
                  }}
                  tabIndex={0}
                  className="hover:bg-accent focus:bg-accent flex cursor-pointer items-center rounded p-2 focus:outline-none"
                  onClick={() => callSelectTool(item as Tables<"tools">)}
                  onKeyDown={getKeyDownHandler(index)}
                >
                  <div className={"w-[32px]"}>
                    <IconPuzzle size={32} />
                  </div>
                  <div className="ml-3 flex flex-col">
                    <div className="font-semibold">{item.name}</div>

                    <div className="line-clamp-1 max-w-full overflow-hidden text-ellipsis opacity-60">
                      {item.description}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </>
  )
}
