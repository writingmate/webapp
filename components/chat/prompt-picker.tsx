import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Label } from "../ui/label"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { usePromptAndCommand } from "./chat-hooks/use-prompt-and-command"
import { getPublicPrompts } from "@/db/prompts"
import { Picker } from "@/components/picker/picker"

interface PromptPickerProps {}

export const PromptPicker: FC<PromptPickerProps> = ({}) => {
  const {
    prompts,
    isPromptPickerOpen,
    setIsPromptPickerOpen,
    focusPrompt,
    slashCommand,
    setPromptVariables,
    promptVariables,
    showPromptVariables,
    setShowPromptVariables
  } = useContext(ChatbotUIContext)

  const { handleSelectPrompt, handleSelectPromptWithVariables } =
    usePromptAndCommand()

  const [publicPrompts, setPublicPrompts] = useState<Tables<"prompts">[]>([])

  useEffect(() => {
    getPublicPrompts().then(prompts => {
      setPublicPrompts(prompts)
    })
  }, [focusPrompt])

  const [isTyping, setIsTyping] = useState(false)

  const filteredPrompts = prompts.filter(prompt =>
    prompt.name.toLowerCase().includes(slashCommand.toLowerCase())
  )

  const handleSubmitPromptVariables = () => {
    const newPromptContent = promptVariables.reduce(
      (prevContent, variable) =>
        prevContent.replace(
          new RegExp(`\\{\\{${variable.name}\\}\\}`, "g"),
          variable.value
        ),
      [...publicPrompts, ...prompts].find(
        prompt => prompt.id === promptVariables[0].promptId
      )?.content || ""
    )

    const newPrompt: any = {
      ...prompts.find(prompt => prompt.id === promptVariables[0].promptId),
      content: newPromptContent
    }

    handleSelectPrompt(newPrompt)
    setIsPromptPickerOpen(false)
    setShowPromptVariables(false)
    setPromptVariables([])
  }

  const handleCancelPromptVariables = () => {
    setShowPromptVariables(false)
    setPromptVariables([])
  }

  const handleKeydownPromptVariables = (
    e: React.KeyboardEvent<HTMLDivElement>
  ) => {
    if (!isTyping && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitPromptVariables()
    }
  }

  return (
    <>
      <Dialog open={showPromptVariables} onOpenChange={setShowPromptVariables}>
        <DialogContent onKeyDown={handleKeydownPromptVariables}>
          <DialogHeader>
            <DialogTitle>Enter Prompt Variables</DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-6">
            {promptVariables.map((variable, index) => (
              <div key={index} className="flex flex-col space-y-2">
                <Label>{variable.name}</Label>

                <TextareaAutosize
                  placeholder={`Enter a value for ${variable.name}...`}
                  value={variable.value}
                  onValueChange={value => {
                    const newPromptVariables = [...promptVariables]
                    newPromptVariables[index].value = value
                    setPromptVariables(newPromptVariables)
                  }}
                  minRows={3}
                  maxRows={5}
                  onCompositionStart={() => setIsTyping(true)}
                  onCompositionEnd={() => setIsTyping(false)}
                />
              </div>
            ))}
          </div>

          <div className="mt-2 flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelPromptVariables}
            >
              Cancel
            </Button>

            <Button size="sm" onClick={handleSubmitPromptVariables}>
              Submit
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Picker
        items={filteredPrompts}
        focusItem={focusPrompt}
        isOpen={isPromptPickerOpen}
        setIsOpen={setIsPromptPickerOpen}
        command={slashCommand}
        handleSelectItem={handleSelectPromptWithVariables}
      />
    </>
  )
}
