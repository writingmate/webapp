// TODO: Separate into multiple contexts, keeping simple for now

"use client"

import { ChatbotUIContext } from "@/context/context"
import { getProfileByUserId } from "@/db/profile"
import { getWorkspaceImageFromStorage } from "@/db/storage/workspace-images"
import { getWorkspaceById, getWorkspacesByUserId } from "@/db/workspaces"
import { convertBlobToBase64 } from "@/lib/blob-to-b64"
import {
  fetchHostedModels,
  fetchOllamaModels,
  fetchOpenRouterModels
} from "@/lib/models/fetch-models"
import { supabase } from "@/lib/supabase/browser-client"
import { Tables } from "@/supabase/types"
import {
  ChatFile,
  ChatMessage,
  ChatSettings,
  LLM,
  LLMID,
  MessageImage,
  OpenRouterLLM,
  WorkspaceImage
} from "@/types"
import { AssistantImage } from "@/types/images/assistant-image"
import { VALID_ENV_KEYS } from "@/types/valid-keys"
import { useRouter } from "next/navigation"
import { FC, useEffect, useState } from "react"
import { isMobileScreen } from "@/lib/mobile"
import { getPublicAssistants } from "@/db/assistants"
import { getPublicTools } from "@/db/tools"
import { getPlatformTools } from "@/db/platform-tools"
import { onlyUniqueById } from "@/lib/utils"
import { getAssistantPublicImageUrl } from "@/db/storage/assistant-images"
import Loading from "@/app/loading"

interface GlobalStateProps {
  children: React.ReactNode
}

export const GlobalState: FC<GlobalStateProps> = ({ children }) => {
  const router = useRouter()

  // PROFILE STORE
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null)

  // ITEMS STORE
  const [assistants, setAssistants] = useState<Tables<"assistants">[]>([])
  const [collections, setCollections] = useState<Tables<"collections">[]>([])
  const [chats, setChats] = useState<Tables<"chats">[]>([])
  const [files, setFiles] = useState<Tables<"files">[]>([])
  const [folders, setFolders] = useState<Tables<"folders">[]>([])
  const [models, setModels] = useState<Tables<"models">[]>([])
  const [presets, setPresets] = useState<Tables<"presets">[]>([])
  const [prompts, setPrompts] = useState<Tables<"prompts">[]>([])
  const [tools, setTools] = useState<Tables<"tools">[]>([])
  const [platformTools, setPlatformTools] = useState<Tables<"tools">[]>([])
  const [workspaces, setWorkspaces] = useState<Tables<"workspaces">[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // MODELS STORE
  const [envKeyMap, setEnvKeyMap] = useState<Record<string, VALID_ENV_KEYS>>({})
  const [availableHostedModels, setAvailableHostedModels] = useState<LLM[]>([])
  const [availableLocalModels, setAvailableLocalModels] = useState<LLM[]>([])
  const [availableOpenRouterModels, setAvailableOpenRouterModels] = useState<
    OpenRouterLLM[]
  >([])

  // WORKSPACE STORE
  const [selectedWorkspace, setSelectedWorkspace] =
    useState<Tables<"workspaces"> | null>(null)
  const [workspaceImages, setWorkspaceImages] = useState<WorkspaceImage[]>([])

  // PRESET STORE
  const [selectedPreset, setSelectedPreset] =
    useState<Tables<"presets"> | null>(null)

  // ASSISTANT STORE
  const [selectedAssistant, setSelectedAssistant] =
    useState<Tables<"assistants"> | null>(null)
  const [assistantImages, setAssistantImages] = useState<AssistantImage[]>([])
  const [openaiAssistants, setOpenaiAssistants] = useState<any[]>([])

  // PASSIVE CHAT STORE
  const [userInput, setUserInput] = useState<string>("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatSettings, setChatSettings] = useState<ChatSettings>(() => {
    if (typeof window !== "undefined") {
      const storedSettings = window?.localStorage?.getItem("chatSettings")

      if (storedSettings) {
        return JSON.parse(storedSettings)
      }
    }

    return {
      model: "gpt-3.5-turbo-0125",
      prompt: "You are a helpful AI assistant.",
      temperature: 0.5,
      contextLength: 4000,
      includeProfileContext: true,
      includeWorkspaceInstructions: true,
      embeddingsProvider: "openai"
    }
  })
  const [selectedChat, setSelectedChat] = useState<Tables<"chats"> | null>(null)
  const [chatFileItems, setChatFileItems] = useState<Tables<"file_items">[]>([])

  // ACTIVE CHAT STORE
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [firstTokenReceived, setFirstTokenReceived] = useState<boolean>(false)
  const [abortController, setAbortController] =
    useState<AbortController | null>(null)

  // CHAT INPUT COMMAND STORE
  const [isMessageHistoryPickerOpen, setIsMessageHistoryPickerOpen] =
    useState(false)
  const [isPromptPickerOpen, setIsPromptPickerOpen] = useState(false)
  const [slashCommand, setSlashCommand] = useState("")
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false)
  const [hashtagCommand, setHashtagCommand] = useState("")
  const [isToolPickerOpen, setIsToolPickerOpen] = useState(false)
  const [toolCommand, setToolCommand] = useState("")
  const [focusPrompt, setFocusPrompt] = useState(false)
  const [focusFile, setFocusFile] = useState(false)
  const [focusTool, setFocusTool] = useState(false)
  const [focusAssistant, setFocusAssistant] = useState(false)
  const [atCommand, setAtCommand] = useState("")
  const [isAssistantPickerOpen, setIsAssistantPickerOpen] = useState(false)
  const [showPromptVariables, setShowPromptVariables] = useState(false)
  const [promptVariables, setPromptVariables] = useState<
    {
      promptId: string
      name: string
      value: string
    }[]
  >([])

  // ATTACHMENTS STORE
  const [chatFiles, setChatFiles] = useState<ChatFile[]>([])
  const [chatImages, setChatImages] = useState<MessageImage[]>([])
  const [newMessageFiles, setNewMessageFiles] = useState<ChatFile[]>([])
  const [newMessageImages, setNewMessageImages] = useState<MessageImage[]>([])
  const [showFilesDisplay, setShowFilesDisplay] = useState<boolean>(false)

  // RETIEVAL STORE
  const [useRetrieval, setUseRetrieval] = useState<boolean>(true)
  const [sourceCount, setSourceCount] = useState<number>(4)

  // TOOL STORE
  const [selectedTools, setSelectedTools] = useState<Tables<"tools">[]>([])
  const [toolInUse, setToolInUse] = useState<string>("none")

  // PAYWALL

  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false)

  // SIDEBAR
  const [showSidebar, setShowSidebar] = useState<boolean>(
    () => !isMobileScreen()
  )

  useEffect(() => {
    ;(async () => {
      const profile = await fetchStartingData()
      const hostedModelRes = await fetchHostedModels(profile)
      if (!hostedModelRes) return

      setEnvKeyMap(hostedModelRes.envKeyMap)
      setAvailableHostedModels(hostedModelRes.hostedModels)

      if (profile) {
        if (!profile.has_onboarded) {
          return router.push("/setup")
        }

        if (
          profile["openrouter_api_key"] ||
          hostedModelRes.envKeyMap["openrouter"]
        ) {
          const openRouterModels = await fetchOpenRouterModels()
          if (!openRouterModels) return
          setAvailableOpenRouterModels(openRouterModels)
        }
      }

      if (process.env.NEXT_PUBLIC_OLLAMA_URL) {
        const localModels = await fetchOllamaModels()
        if (!localModels) return
        setAvailableLocalModels(localModels)
      }
    })()
  }, [])

  useEffect(() => {
    if (chatSettings) {
      localStorage.setItem("chatSettings", JSON.stringify(chatSettings))
    }
  }, [chatSettings])

  const fetchStartingData = async (): Promise<
    Tables<"profiles"> | undefined
  > => {
    const session = (await supabase.auth.getSession()).data.session

    if (!session) {
      setLoading(false)
      return undefined
    }
    const user = session.user

    const profile = await getProfileByUserId(user.id)

    setProfile(profile)

    if (!profile?.has_onboarded) {
      return profile
    }

    const workspaces = await getWorkspacesByUserId(user.id)
    setWorkspaces(workspaces)
    setSelectedWorkspace(workspaces?.[0])

    for (const workspace of workspaces) {
      let workspaceImageUrl = ""

      if (workspace.image_path) {
        workspaceImageUrl =
          (await getWorkspaceImageFromStorage(workspace.image_path)) || ""
      }

      if (workspaceImageUrl) {
        const response = await fetch(workspaceImageUrl)
        const blob = await response.blob()
        const base64 = await convertBlobToBase64(blob)

        setWorkspaceImages(prev => [
          ...prev,
          {
            workspaceId: workspace.id,
            path: workspace.image_path,
            base64: base64,
            url: workspaceImageUrl
          }
        ])
      }
    }

    await fetchWorkspaceData(workspaces.find(w => w.is_home)?.id as string)
    setUserInput("")
    setChatMessages([])
    setSelectedChat(null)
    setIsGenerating(false)
    setFirstTokenReceived(false)
    setChatFiles([])
    setChatImages([])
    setNewMessageFiles([])
    setNewMessageImages([])
    setShowFilesDisplay(false)

    return profile
  }

  const fetchWorkspaceData = async (workspaceId: string) => {
    setLoading(true)

    try {
      const workspace = await getWorkspaceById(workspaceId)
      if (!workspace) {
        router.push("/")
        return
      }
      setSelectedWorkspace(workspace)

      const [publicAssistantData, publicToolData, platformToolData] =
        await Promise.all([
          getPublicAssistants(),
          getPublicTools(),
          getPlatformTools()
        ])

      setAssistants(
        [...workspace.assistants, ...publicAssistantData].filter(onlyUniqueById)
      )
      setChats(workspace.chats)
      setFolders(workspace.folders)
      setFiles(workspace.files)
      setPrompts(workspace.prompts)
      setTools(
        [...platformToolData, ...workspace.tools, ...publicToolData].filter(
          onlyUniqueById
        )
      )
      setPlatformTools(platformToolData)
      setModels(workspace.models)

      const parallelize = async (array: any, callback: any) => {
        const promises = array.map((item: any) => callback(item))
        return Promise.all(promises)
      }

      await parallelize(
        [...workspace.assistants, ...publicAssistantData],
        async (assistant: any) => {
          let url = assistant.image_path
            ? getAssistantPublicImageUrl(assistant.image_path)
            : ""

          if (url) {
            // const response = await fetch(url)
            // const blob = await response.blob()
            // const base64 = await convertBlobToBase64(blob)

            setAssistantImages(prev => [
              ...prev,
              {
                assistantId: assistant.id,
                path: assistant.image_path,
                base64: "",
                url
              }
            ])
          } else {
            setAssistantImages(prev => [
              ...prev,
              {
                assistantId: assistant.id,
                path: assistant.image_path,
                base64: "",
                url
              }
            ])
          }
        }
      )

      setLoading(false)

      setChatSettings({
        model: (chatSettings?.model ||
          workspace?.default_model ||
          "gpt-3.5-turbo-0125") as LLMID,
        prompt:
          // chatSettings?.prompt ||
          workspace?.default_prompt ||
          "You are a friendly, helpful AI assistant.",
        temperature:
          // chatSettings?.temperature ||
          workspace?.default_temperature || 0.5,
        contextLength:
          // chatSettings?.contextLength ||
          workspace?.default_context_length || 4096,
        includeProfileContext:
          // chatSettings?.includeProfileContext ||
          workspace?.include_profile_context || true,
        includeWorkspaceInstructions:
          // chatSettings?.includeWorkspaceInstructions ||
          workspace?.include_workspace_instructions || true,
        embeddingsProvider:
          // chatSettings?.embeddingsProvider ||
          (workspace?.embeddings_provider as "openai" | "local") || "openai"
      })
    } catch (error) {
      console.error(error)
      router.push("/")
    }
  }

  return (
    <ChatbotUIContext.Provider
      value={{
        // PROFILE STORE
        profile,
        setProfile,

        // ITEMS STORE
        assistants,
        setAssistants,
        collections,
        setCollections,
        chats,
        setChats,
        files,
        setFiles,
        folders,
        setFolders,
        models,
        setModels,
        presets,
        setPresets,
        prompts,
        setPrompts,
        tools,
        setTools,
        platformTools,
        setPlatformTools,
        workspaces,
        setWorkspaces,

        // MODELS STORE
        envKeyMap,
        setEnvKeyMap,
        availableHostedModels,
        setAvailableHostedModels,
        availableLocalModels,
        setAvailableLocalModels,
        availableOpenRouterModels,
        setAvailableOpenRouterModels,

        // WORKSPACE STORE
        selectedWorkspace,
        setSelectedWorkspace,
        workspaceImages,
        setWorkspaceImages,

        // PRESET STORE
        selectedPreset,
        setSelectedPreset,

        // ASSISTANT STORE
        selectedAssistant,
        setSelectedAssistant,
        assistantImages,
        setAssistantImages,
        openaiAssistants,
        setOpenaiAssistants,

        // PASSIVE CHAT STORE
        userInput,
        setUserInput,
        chatMessages,
        setChatMessages,
        chatSettings,
        setChatSettings,
        selectedChat,
        setSelectedChat,
        chatFileItems,
        setChatFileItems,

        // ACTIVE CHAT STORE
        isGenerating,
        setIsGenerating,
        firstTokenReceived,
        setFirstTokenReceived,
        abortController,
        setAbortController,

        // CHAT INPUT COMMAND STORE
        isMessageHistoryPickerOpen,
        setIsMessageHistoryPickerOpen,
        isPromptPickerOpen,
        setIsPromptPickerOpen,
        slashCommand,
        setSlashCommand,
        isFilePickerOpen,
        setIsFilePickerOpen,
        hashtagCommand,
        setHashtagCommand,
        isToolPickerOpen,
        setIsToolPickerOpen,
        toolCommand,
        setToolCommand,
        focusPrompt,
        setFocusPrompt,
        focusFile,
        setFocusFile,
        focusTool,
        setFocusTool,
        focusAssistant,
        setFocusAssistant,
        atCommand,
        setAtCommand,
        isAssistantPickerOpen,
        setIsAssistantPickerOpen,
        promptVariables,
        setPromptVariables,
        showPromptVariables,
        setShowPromptVariables,

        // ATTACHMENT STORE
        chatFiles,
        setChatFiles,
        chatImages,
        setChatImages,
        newMessageFiles,
        setNewMessageFiles,
        newMessageImages,
        setNewMessageImages,
        showFilesDisplay,
        setShowFilesDisplay,

        // RETRIEVAL STORE
        useRetrieval,
        setUseRetrieval,
        sourceCount,
        setSourceCount,

        // TOOL STORE
        selectedTools,
        setSelectedTools,
        toolInUse,
        setToolInUse,

        // PAYWALL
        isPaywallOpen,
        setIsPaywallOpen,

        showSidebar,
        setShowSidebar
      }}
    >
      {children}
    </ChatbotUIContext.Provider>
  )
}
