import { ChatbotUIContext } from "@/context/context"
import { getAssistantCollectionsByAssistantId } from "@/db/assistant-collections"
import { getAssistantFilesByAssistantId } from "@/db/assistant-files"
import { getAssistantToolsByAssistantId } from "@/db/assistant-tools"
import { getCollectionFilesByCollectionId } from "@/db/collection-files"
import { Tables } from "@/supabase/types"
import { LLMID } from "@/types"
import { useContext } from "react"
import { ChatbotUIChatContext } from "@/context/chat"
import { useRouter } from "next/navigation"

export const usePromptAndCommand = () => {
  const {
    selectedWorkspace,
    chatFiles,
    newMessageFiles,
    setNewMessageFiles,
    setShowFilesDisplay,
    setIsPromptPickerOpen,
    setIsFilePickerOpen,
    setSlashCommand,
    setHashtagCommand,
    setUseRetrieval,
    setToolCommand,
    setIsToolPickerOpen,
    setAtCommand,
    setIsAssistantPickerOpen,
    setSelectedAssistant,
    setChatFiles,
    setPromptVariables,
    setShowPromptVariables,
    profile
  } = useContext(ChatbotUIContext)

  const router = useRouter()

  const {
    userInput,
    setUserInput,
    selectedTools,
    setSelectedTools,
    setChatSettings
  } = useContext(ChatbotUIChatContext)

  const handleInputChange = (value: string) => {
    const assistantTextRegex = new RegExp(
      `^${profile?.assistant_command}([^ ]*)$`
    )
    const promptTextRegex = new RegExp(`^${profile?.prompt_command}([^ ]*)$`)
    const filesTextRegex = new RegExp(`^${profile?.files_command}([^ ]*)$`)
    const toolTextRegex = new RegExp(`^${profile?.tools_command}([^ ]*)$`)
    const assistantMatch = value.match(assistantTextRegex)
    const promptMatch = value.match(promptTextRegex)
    const filesMatch = value.match(filesTextRegex)
    const toolMatch = value.match(toolTextRegex)

    if (assistantMatch) {
      setIsAssistantPickerOpen(true)
      setAtCommand(assistantMatch[1])
    } else if (promptMatch) {
      setIsPromptPickerOpen(true)
      setSlashCommand(promptMatch[1])
    } else if (filesMatch) {
      setIsFilePickerOpen(true)
      setHashtagCommand(filesMatch[1])
    } else if (toolMatch) {
      setIsToolPickerOpen(true)
      setToolCommand(toolMatch[1])
    } else {
      setIsPromptPickerOpen(false)
      setIsFilePickerOpen(false)
      setIsToolPickerOpen(false)
      setIsAssistantPickerOpen(false)
      setSlashCommand("")
      setHashtagCommand("")
      setToolCommand("")
      setAtCommand("")
    }

    setUserInput(value)
  }

  const handleSelectPromptWithVariables = (prompt: Tables<"prompts">) => {
    const regex = /\{\{.*?\}\}/g
    const matches = prompt.content.match(regex)

    if (matches) {
      const newPromptVariables = matches.map(match => ({
        promptId: prompt.id,
        name: match.replace(/\{\{|\}\}/g, ""),
        value: ""
      }))

      setPromptVariables(newPromptVariables)
      setShowPromptVariables(true)
    } else {
      handleSelectPrompt(prompt)
      setIsPromptPickerOpen(false)
    }
  }

  const handleSelectPrompt = (prompt: Tables<"prompts">) => {
    setIsPromptPickerOpen(false)
    setUserInput(userInput.replace(/\/[^ ]*$/, "") + prompt.content)
  }

  const handleSelectHistoryMessage = (message: string) => {
    setIsPromptPickerOpen(false)
    setUserInput(userInput.replace(/\/[^ ]*$/, "") + message)
  }

  const handleSelectUserFile = async (file: Tables<"files">) => {
    setShowFilesDisplay(true)
    setIsFilePickerOpen(false)
    setUseRetrieval(true)

    if (newMessageFiles.some(chatFile => chatFile.id === file.id)) {
      setNewMessageFiles(prev => {
        const result = prev.filter(prevFile => prevFile.id !== file.id)

        if (result.length === 0 && chatFiles.length === 0) {
          setUseRetrieval(false)
        }

        return result
      })

      setChatFiles(prev => {
        const result = prev.filter(chatFile => chatFile.id !== file.id)

        if (result.length === 0 && newMessageFiles.length === 0) {
          setUseRetrieval(false)
        }

        return result
      })

      return
    }

    setNewMessageFiles(prev => {
      const fileAlreadySelected =
        prev.some(prevFile => prevFile.id === file.id) ||
        chatFiles.some(chatFile => chatFile.id === file.id)

      if (!fileAlreadySelected) {
        return [
          ...prev,
          {
            id: file.id,
            name: file.name,
            type: file.type,
            file: null
          }
        ]
      }
      return prev
    })

    setUserInput(userInput.replace(/#[^ ]*$/, ""))
  }

  const handleSelectUserCollection = async (
    collection: Tables<"collections">
  ) => {
    setShowFilesDisplay(true)
    setIsFilePickerOpen(false)
    setUseRetrieval(true)

    const collectionFiles = await getCollectionFilesByCollectionId(
      collection.id
    )

    setNewMessageFiles(prev => {
      const newFiles = collectionFiles.files
        .filter(
          file =>
            !prev.some(prevFile => prevFile.id === file.id) &&
            !chatFiles.some(chatFile => chatFile.id === file.id)
        )
        .map(file => ({
          id: file.id,
          name: file.name,
          type: file.type,
          file: null
        }))

      return [...prev, ...newFiles]
    })

    setUserInput(userInput.replace(/#[^ ]*$/, ""))
  }

  const handleSelectTool = (tool: Tables<"tools">) => {
    setIsToolPickerOpen(false)
    setUserInput(userInput.replace(/![^ ]*$/, ""))
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter(t => t !== tool))
      return
    }
    setSelectedTools(prev => [...new Set([...prev, tool])])
  }

  const handleSelectAssistant = async (assistant: Tables<"assistants">) => {
    setIsAssistantPickerOpen(false)
    setUserInput(userInput.replace(/@[^ ]*$/, ""))
    setSelectedAssistant(assistant)

    setChatSettings({
      model: assistant.model as LLMID,
      prompt: assistant.prompt,
      temperature: assistant.temperature,
      contextLength: assistant.context_length,
      includeProfileContext: assistant.include_profile_context,
      includeWorkspaceInstructions: assistant.include_workspace_instructions,
      embeddingsProvider: assistant.embeddings_provider as "openai" | "local"
    })

    let allFiles = []

    const assistantFiles = (await getAssistantFilesByAssistantId(assistant.id))
      .files
    allFiles = [...assistantFiles]
    const assistantCollections = (
      await getAssistantCollectionsByAssistantId(assistant.id)
    ).collections
    for (const collection of assistantCollections) {
      const collectionFiles = (
        await getCollectionFilesByCollectionId(collection.id)
      ).files
      allFiles = [...allFiles, ...collectionFiles]
    }
    const assistantTools = (await getAssistantToolsByAssistantId(assistant.id))
      .tools

    setSelectedTools(assistantTools)
    setChatFiles(
      allFiles.map(file => ({
        id: file.id,
        name: file.name,
        type: file.type,
        file: null
      }))
    )

    if (allFiles.length > 0) setShowFilesDisplay(true)
  }

  return {
    handleInputChange,
    handleSelectPrompt,
    handleSelectUserFile,
    handleSelectUserCollection,
    handleSelectTool,
    handleSelectAssistant,
    handleSelectPromptWithVariables,
    handleSelectHistoryMessage
  }
}
