import { ChatbotUIContext } from "@/context/context"
import { IconPuzzle } from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Tables } from "@/supabase/types"
import { validatePlanForTools } from "@/lib/subscription"
import { cn } from "@/lib/utils"
import { set } from "date-fns"
import { usePromptAndCommand } from "@/components/chat/chat-hooks/use-prompt-and-command"
import { ChatbotUIChatContext } from "@/context/chat"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"

interface ToolSelectProps {
  className?: string
  selectedTools: Tables<"tools">[]
  onSelectTools: (tools: Tables<"tools">[]) => void
}

function ToolDetails({ tool }: { tool: Tables<"tools"> }) {
  return (
    <div className="mr-2 hidden w-[240px] flex-col space-y-1 border-r px-2 py-1 sm:flex">
      <div className="font-semibold">{tool.name}</div>
      <div className="text-xs">{tool.description}</div>
    </div>
  )
}

export const ToolSelect: FC<ToolSelectProps> = ({
  selectedTools,
  onSelectTools,
  className
}) => {
  const {
    profile,
    tools,
    setIsPaywallOpen,
    focusTool,
    isToolPickerOpen,
    setIsToolPickerOpen
  } = useContext(ChatbotUIContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [flash, setFlash] = useState(false)

  const [hoveredTool, setHoveredTool] = useState<Tables<"tools">>(tools[0])

  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  const { handleFocusChatInput } = useChatHandler()

  useEffect(() => {
    if (isToolPickerOpen && focusTool && itemsRef.current[0]) {
      itemsRef.current[0].focus()
    }
  }, [focusTool])

  const handleOpenChange = (isOpen: boolean) => {
    setIsToolPickerOpen(isOpen)
    handleFocusChatInput()
  }

  const getKeyDownHandler =
    (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault()
        handleOpenChange(false)
      } else if (e.key === "Enter") {
        e.preventDefault()
        handleSelectTool(tools[index])
      } else if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        !e.shiftKey &&
        index === tools.length - 1
      ) {
        e.preventDefault()
        itemsRef.current[0]?.focus()
        setHoveredTool(tools[0])
      } else if (e.key === "ArrowUp" && !e.shiftKey && index === 0) {
        // go to last element if arrow up is pressed on first element
        e.preventDefault()
        itemsRef.current[itemsRef.current.length - 1]?.focus()
        setHoveredTool(tools[itemsRef.current.length - 1])
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const prevIndex =
          index - 1 >= 0 ? index - 1 : itemsRef.current.length - 1
        itemsRef.current[prevIndex]?.focus()
        setHoveredTool(tools[prevIndex])
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIndex = index + 1 < itemsRef.current.length ? index + 1 : 0
        itemsRef.current[nextIndex]?.focus()
        setHoveredTool(tools[nextIndex])
      }
    }

  useEffect(() => {
    if (isToolPickerOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // FIX: hacky
    }
  }, [isToolPickerOpen])

  function createHandleSelectTool(tool: Tables<"tools">) {
    return (selected: boolean) => {
      handleSelectTool(tool)
    }
  }

  function handleSelectTool(tool: Tables<"tools">) {
    if (!validatePlanForTools(profile, [tool])) {
      setIsPaywallOpen(true)
      return
    }
    const selected = selectedTools.some(t => t.id === tool.id)
    if (!selected) {
      onSelectTools([...selectedTools, tool])
    } else {
      onSelectTools(selectedTools.filter(t => t.id !== tool.id))
    }
  }

  useEffect(() => {
    if (!isToolPickerOpen) {
      setFlash(true)
      setTimeout(() => {
        setFlash(false)
      }, 500)
    }
  }, [selectedTools, isToolPickerOpen])

  if (!profile) return null

  return (
    <DropdownMenu
      open={isToolPickerOpen}
      onOpenChange={isOpen => {
        handleOpenChange(isOpen)
      }}
    >
      <DropdownMenuTrigger>
        <Button
          ref={triggerRef}
          className={cn(
            "relative flex items-center justify-between space-x-0 border-0",
            flash ? "animate-bounce" : "",
            className
          )}
          variant="ghost"
        >
          <IconPuzzle stroke={1.5} />
          <div
            className={
              "bg-foreground text-background absolute bottom-1 right-2 size-4 rounded-full text-xs font-semibold"
            }
          >
            {selectedTools.length}
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="relative mx-2 ml-[-140px] flex max-h-[300px] overflow-auto p-2"
        // style={{ width: triggerRef.current?.offsetWidth }}
      >
        <ToolDetails tool={hoveredTool} />
        <div>
          {tools.map((tool, index) => {
            return (
              <DropdownMenuItem
                ref={ref => {
                  itemsRef.current[index] = ref
                }}
                key={tool.id}
                onKeyDown={getKeyDownHandler(index)}
                onMouseEnter={() => setHoveredTool(tool as Tables<"tools">)}
                className={"flex w-full justify-between space-x-3"}
              >
                <div>{tool.name}</div>
                <Switch
                  checked={selectedTools.some(t => t.id === tool.id)}
                  onClick={e => e.stopPropagation()}
                  onCheckedChange={() => handleSelectTool(tool)}
                />
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
