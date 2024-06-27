import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { IconRobotFace } from "@tabler/icons-react"
import Image from "next/image"
import { FC, useContext, useEffect, useRef } from "react"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { useClickOutside } from "@/components/chat/picker-hooks/use-click-outside"
import { validatePlanForAssistant } from "@/lib/subscription"
import { AssistantIcon } from "@/components/assistants/assistant-icon"
import { ChatbotUIChatContext } from "@/context/chat"
import { Picker } from "@/components/picker/picker"

interface AssistantPickerProps {}

export const AssistantPicker: FC<AssistantPickerProps> = ({}) => {
  const {
    profile,
    assistants,
    focusAssistant,
    atCommand,
    isAssistantPickerOpen,
    setIsAssistantPickerOpen,
    setIsPaywallOpen
  } = useContext(ChatbotUIContext)

  const { handleSelectAssistant } = usePromptAndCommand()

  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (itemsRef.current?.[0]) {
      itemsRef.current[0].focus()
    }
  }, [focusAssistant])

  const filteredAssistants = assistants.filter(assistant =>
    assistant.name.toLowerCase().includes(atCommand.toLowerCase())
  )

  useClickOutside(itemsRef, () => setIsAssistantPickerOpen(false))

  const handleOpenChange = (isOpen: boolean) => {
    setIsAssistantPickerOpen(isOpen)
  }

  const callSelectAssistant = (assistant: Tables<"assistants">) => {
    if (!validatePlanForAssistant(profile, assistant)) {
      setIsPaywallOpen(true)
      return
    }
    handleSelectAssistant(assistant)
    handleOpenChange(false)
  }

  return (
    <Picker
      items={filteredAssistants}
      isOpen={isAssistantPickerOpen}
      setIsOpen={handleOpenChange}
      focusItem={focusAssistant}
      command={atCommand}
      iconRenderer={assistant => (
        <AssistantIcon size={24} assistant={assistant} />
      )}
      handleSelectItem={callSelectAssistant}
    />
  )
}
