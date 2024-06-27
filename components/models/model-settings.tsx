import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { LLM, LLMID } from "@/types"
import { ModelVisibilityOption } from "@/components/models/model-visibility-option"
import { IconSettings } from "@tabler/icons-react"
import { useContext, useEffect, useState } from "react"
import { ChatbotUIContext } from "@/context/context"
import { Button } from "@/components/ui/button"
import { updateProfile } from "@/db/profile"
import {
  AdvancedContent,
  InfoIconTooltip
} from "@/components/ui/chat-settings-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import {
  DEFAULT_SYSTEM_PROMPT,
  validateSystemPromptTemplate
} from "@/lib/build-prompt"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { updateWorkspace } from "@/db/workspaces"

export const DEFAULT_MODEL_VISIBILITY: Record<LLMID, boolean> = {
  "gpt-3.5-turbo-0125": true,
  "gpt-4-vision-preview": false,
  "gpt-4-turbo-preview": false,
  "gpt-4-turbo": true,
  "claude-3-haiku-20240307": true,
  "claude-3-sonnet-20240229": false,
  "claude-3-5-sonnet-20240620": true,
  "claude-3-opus-20240229": false,
  "gemini-pro": false,
  "gemini-pro-vision": false,
  "mistral-large-latest": true,
  "mixtral-8x7b-32768": true,
  "sonar-small-online": true,
  "sonar-medium-online": true,
  "sonar-small-chat": false,
  "sonar-medium-chat": false,
  "gpt-4": false,
  "gpt-3.5-turbo": false,
  "gemini-1.5-pro-latest": true,
  "claude-2.1": false,
  "claude-instant-1.2": false,
  "mistral-tiny": false,
  "mistral-small": false,
  "mistral-medium": false,
  "pplx-7b-online": false,
  "pplx-70b-online": false,
  "pplx-7b-chat": false,
  "pplx-70b-chat": false,
  "mixtral-8x7b-instruct": false,
  "mistral-7b-instruct": false,
  "llama-2-70b-chat": false,
  "codellama-34b-instruct": false,
  "codellama-70b-instruct": false,
  "llama3-70b-8192": false,
  "llama3-8b-8192": false,
  "gpt-4o": true,
  "gemini-1.5-flash-latest": true
}

const SYSTEM_PROMPT_DESCRIPTION = `
The system prompt is a message that the AI will use to start the conversation. 
It should contain the following dynamic variables for ChatLabs functioning properly: {profile_context}, {local_date}, and {assistant}. {profile_context} is the user's profile context, {local_date} is the current date, and {assistant} is the name of the assistant and it's instructions.
`

const SYSTEM_PROMPT_WARNING = `
The system prompt should contain the following dynamic variables for ChatLabs functioning properly: {profile_context}, {local_date}, and {assistant}. {profile_context} is the user's profile context, {local_date} is the current date, and {assistant} is the name of the assistant and it's instructions.`

function ModelSettings({ models }: { models?: LLM[] }) {
  const {
    profile,
    selectedWorkspace,
    setChatSettings,
    setProfile,
    chatSettings
  } = useContext(ChatbotUIContext)

  const [dialogOpen, setDialogOpen] = useState(false)

  const [visibility, setVisibility] = useState<Record<LLMID, boolean>>(
    (profile?.model_visibility || DEFAULT_MODEL_VISIBILITY) as Record<
      LLMID,
      boolean
    >
  )

  const [systemPromptTemplate, setSystemPromptTemplate] = useState(
    profile?.system_prompt_template || DEFAULT_SYSTEM_PROMPT
  )

  const validSystemPrompt = validateSystemPromptTemplate(systemPromptTemplate)

  function handleSave() {
    if (!profile) {
      return
    }
    setProfile({
      ...profile,
      model_visibility: visibility,
      system_prompt_template: systemPromptTemplate
    })
    updateProfile(profile.id, {
      ...profile,
      model_visibility: visibility,
      system_prompt_template: systemPromptTemplate
    })
    updateWorkspace(selectedWorkspace!.id, {
      ...selectedWorkspace!,
      default_temperature: chatSettings?.temperature,
      default_context_length: chatSettings?.contextLength
    })
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <div
          className={
            "hover:bg-accent flex w-full cursor-pointer items-center justify-start space-x-3 truncate rounded p-2 text-sm hover:opacity-50"
          }
        >
          <IconSettings stroke={1.5} className={"mr-2 opacity-50"} size={24} />{" "}
          Manage models
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Manage models</DialogTitle>
        <Tabs className={"flex w-full flex-col justify-center"}>
          <TabsList className={"mx-auto"}>
            <TabsTrigger value={"basic"} title={"Basic settings"}>
              Model parameters
            </TabsTrigger>
            <TabsTrigger value={"visibility"} title={"Model visibility"}>
              Model visibility
            </TabsTrigger>
          </TabsList>
          <TabsContent value={"basic"}>
            <div className="mb-4 mt-2 flex items-center space-x-2">
              <Label>System Prompt</Label>
              <InfoIconTooltip label={SYSTEM_PROMPT_DESCRIPTION} />
            </div>
            <TextareaAutosize
              minRows={3}
              className="mt-2"
              value={systemPromptTemplate}
              onValueChange={value => {
                setSystemPromptTemplate(value)
              }}
            />
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => {
                  setSystemPromptTemplate(DEFAULT_SYSTEM_PROMPT)
                }}
                className={"text-xs"}
                variant={"link"}
              >
                Reset to default
              </Button>
              {!validSystemPrompt && (
                <WithTooltip
                  trigger={
                    <div className="text-xs text-yellow-500">
                      Missing dynamic variables
                    </div>
                  }
                  display={SYSTEM_PROMPT_WARNING}
                />
              )}
            </div>
            <AdvancedContent
              showOverrideSystemPrompt={true}
              chatSettings={chatSettings!}
              onChangeChatSettings={setChatSettings}
              showTooltip={true}
            />
          </TabsContent>
          <TabsContent value={"visibility"}>
            <div className="max-h-[360px] w-full space-y-0 overflow-y-auto">
              {models?.map(model => (
                <ModelVisibilityOption
                  key={model.modelId}
                  selected={!!visibility?.[model.modelId]}
                  model={model}
                  onSelect={checked => {
                    setVisibility({
                      ...visibility,
                      [model.modelId]: checked
                    })
                  }}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
        <Button onClick={handleSave}>Save for all future chats</Button>
      </DialogContent>
    </Dialog>
  )
}

export { ModelSettings }
