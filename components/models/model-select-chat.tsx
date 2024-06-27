import { ChatbotUIContext } from "@/context/context"
import { LLM, LLMID, ModelProvider } from "@/types"
import {
  IconCheck,
  IconChevronDown,
  IconSquarePlus,
  IconX
} from "@tabler/icons-react"
import { FC, useContext, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSubContent2,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
import { ModelIcon } from "./model-icon"
import { ModelOption } from "./model-option"
import { getMostRecentModels } from "@/db/models"
import { Tables } from "@/supabase/types"
import { Separator } from "@/components/ui/separator"
import {
  DEFAULT_MODEL_VISIBILITY,
  ModelSettings
} from "@/components/models/model-settings"
import { validatePlanForModel } from "@/lib/subscription"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { ModelDetails } from "@/components/models/model-details"

interface ModelSelectProps {
  selectedModelId: string
  detailsLocation?: "left" | "right"
  onSelectModel: (modelId: LLMID) => void
  showModelSettings?: boolean
}

export const ModelSelectChat: FC<ModelSelectProps> = ({
  selectedModelId,
  onSelectModel,
  detailsLocation = "left",
  showModelSettings = true
}) => {
  const {
    profile,
    models,
    availableHostedModels,
    availableLocalModels,
    availableOpenRouterModels,
    setIsPaywallOpen
  } = useContext(ChatbotUIContext)

  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"hosted" | "local">("hosted")
  const [mostRecentModels, setMostRecentModels] = useState<
    Tables<"recent_models">[]
  >([])

  const [hoveredModel, setHoveredModel] = useState<LLM | null>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100) // FIX: hacky
    }
  }, [isOpen])

  const handleSelectModel = (modelId: LLMID) => {
    if (!validatePlanForModel(profile, modelId)) {
      setIsPaywallOpen(true)
      return
    }
    onSelectModel(modelId)
    setIsOpen(false)
  }

  const allModels = [
    ...models.map(model => ({
      modelId: model.model_id as LLMID,
      modelName: model.name,
      provider: "custom" as ModelProvider,
      hostedId: model.id,
      platformLink: "",
      imageInput: false,
      paid: "paid" in model ? !!model.paid : false,
      maxContext: null
    })),
    ...availableHostedModels,
    ...availableLocalModels,
    ...availableOpenRouterModels
  ]

  useEffect(() => {
    getMostRecentModels().then(result => {
      setMostRecentModels(result)
    })
  }, [])

  const selectedModel = allModels.find(
    model => model.modelId === selectedModelId
  )

  // if (!profile) return null

  const filteredModels = allModels
    .filter(model => {
      if (tab === "hosted") return model.provider !== "ollama"
      if (tab === "local") return model.provider === "ollama"
      if (tab === "openrouter") return model.provider === "openrouter"
    })
    .filter(
      model =>
        (
          (profile?.model_visibility || DEFAULT_MODEL_VISIBILITY) as Record<
            LLMID,
            boolean
          >
        )?.[model.modelId] ?? false
    )
    .filter(model =>
      model.modelName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.provider.localeCompare(b.provider))

  return (
    <DropdownMenu
      open={isOpen}
      onOpenChange={isOpen => {
        setIsOpen(isOpen)
        setSearch("")
      }}
    >
      <DropdownMenuTrigger
        className="w-full justify-start border-0 px-3 py-5"
        asChild
        disabled={allModels.length === 0}
      >
        {allModels.length === 0 ? (
          <div className="rounded text-sm font-semibold">
            Unlock models by entering API keys in your profile settings.
          </div>
        ) : (
          <Button
            ref={triggerRef}
            className="flex items-center justify-between space-x-1"
            variant="ghost"
          >
            <div className="flex items-center">
              {selectedModel ? (
                <>
                  <ModelIcon
                    provider={selectedModel?.provider}
                    modelId={selectedModel?.modelId}
                    width={26}
                    height={26}
                  />
                  <div className="ml-2 flex items-center text-lg">
                    {selectedModel?.modelName}
                  </div>
                </>
              ) : (
                <div className="flex items-center">Select a model</div>
              )}
            </div>

            <IconChevronDown />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={cn(
          "mx-2 flex items-start justify-between overflow-visible border-0 bg-transparent p-0 shadow-none",
          detailsLocation === "left" ? "flex-row" : "flex-row-reverse"
        )}
      >
        <DropdownMenuSubContent2
          className={
            "relative mr-2 hidden h-auto flex-col justify-between border-r p-4 lg:flex"
          }
        >
          <ModelDetails model={hoveredModel || filteredModels[0]} />
        </DropdownMenuSubContent2>
        <DropdownMenuSubContent2 className="relative mr-2 flex w-[340px] flex-col space-y-2 overflow-auto p-2">
          {availableLocalModels.length > 0 && (
            <Tabs value={tab} onValueChange={(value: any) => setTab(value)}>
              <TabsList defaultValue="hosted" className="grid grid-cols-2">
                <TabsTrigger value="hosted">Hosted</TabsTrigger>
                <TabsTrigger value="local">Local</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <Input
            ref={inputRef}
            className="w-full"
            placeholder="Search models..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="max-h-[300px] overflow-auto">
            {!search && mostRecentModels.length > 0 && (
              <div>
                {mostRecentModels.map(recentModel => {
                  const model = allModels.find(
                    model => model.modelId === recentModel.model
                  )
                  if (!model) return null
                  return (
                    <div
                      onMouseEnter={() => setHoveredModel(model)}
                      key={model.modelId}
                      className="flex items-center space-x-1"
                    >
                      <ModelOption
                        recent={true}
                        key={model.modelId}
                        model={model}
                        selected={false}
                        onSelect={() => handleSelectModel(model.modelId)}
                      />
                    </div>
                  )
                })}
                <Separator className={"opacity-75"} />
              </div>
            )}
            <div className="mb-1">
              {filteredModels.map(model => {
                return (
                  <div
                    key={model.modelId}
                    className="flex items-center space-x-1"
                    onMouseEnter={() => setHoveredModel(model)}
                  >
                    <ModelOption
                      key={model.modelId}
                      model={model}
                      selected={selectedModelId === model.modelId}
                      onSelect={() => handleSelectModel(model.modelId)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
          {showModelSettings && (
            <>
              <Separator className={"opacity-75"} />
              <ModelSettings models={allModels} />
            </>
          )}
        </DropdownMenuSubContent2>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
