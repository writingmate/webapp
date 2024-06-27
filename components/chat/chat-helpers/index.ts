// Only used in use-chat-handler.tsx to keep it clean

import { createChatFiles } from "@/db/chat-files"
import { createChat } from "@/db/chats"
import { createMessageFileItems } from "@/db/message-file-items"
import { createMessages, updateMessage } from "@/db/messages"
import { uploadMessageImage } from "@/db/storage/message-images"
import {
  buildClaudeFinalMessages,
  buildFinalMessages,
  buildGoogleGeminiFinalMessages
} from "@/lib/build-prompt"
import { consumeReadableStream, parseDataStream } from "@/lib/consume-stream"
import { Tables, TablesInsert } from "@/supabase/types"
import {
  ChatFile,
  ChatMessage,
  ChatPayload,
  ChatSettings,
  LLM,
  MessageImage
} from "@/types"
import React from "react"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { SubscriptionRequiredError } from "@/lib/errors"
import { JSONValue } from "ai"
import { validateProPlan } from "@/lib/subscription"
import { encode } from "gpt-tokenizer"

export const validateChatSettings = (
  chatSettings: ChatSettings | null,
  modelData: LLM | undefined,
  profile: Tables<"profiles"> | null,
  selectedWorkspace: Tables<"workspaces"> | null,
  messageContent: string,
  selectedAssistant: Tables<"assistants"> | null,
  selectedTools: Tables<"tools">[]
) => {
  if (!chatSettings) {
    throw new Error("Chat settings not found")
  }

  if (!modelData) {
    throw new Error("Model not found")
  }

  // if (!profile) {
  //   throw new Error("Profile not found")
  // }
  //
  // if (!selectedWorkspace) {
  //   throw new Error("Workspace not found")
  // }

  if (!messageContent) {
    throw new Error("Message content not found")
  }

  if (!validateProPlan(profile) && modelData.paid) {
    throw new SubscriptionRequiredError(
      "Subscription required to use this model"
    )
  }

  if (!validateProPlan(profile) && selectedAssistant) {
    throw new SubscriptionRequiredError(
      "Subscription required to use assistants"
    )
  }

  if (!validateProPlan(profile) && selectedTools?.length > 0) {
    throw new SubscriptionRequiredError("Subscription required to use tools")
  }
}

export const handleRetrieval = async (
  userInput: string,
  newMessageFiles: ChatFile[],
  chatFiles: ChatFile[],
  embeddingsProvider: "openai" | "local",
  sourceCount: number
) => {
  const response = await fetch("/api/retrieval/retrieve", {
    method: "POST",
    body: JSON.stringify({
      userInput,
      fileIds: [...newMessageFiles, ...chatFiles].map(file => file.id),
      embeddingsProvider,
      sourceCount
    })
  })

  if (!response.ok) {
    console.error("Error retrieving:", response)
  }

  const { results } = (await response.json()) as {
    results: Tables<"file_items">[]
  }

  return results
}

export const createTempMessages = (
  messageContent: string,
  chatMessages: ChatMessage[],
  chatSettings: ChatSettings,
  b64Images: string[],
  isRegeneration: boolean,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  selectedAssistant: Tables<"assistants"> | null,
  data = {}
) => {
  let tempUserChatMessage: ChatMessage = {
    message: {
      chat_id: "",
      assistant_id: null,
      content: messageContent,
      created_at: "",
      id: uuidv4(),
      image_paths: b64Images,
      model: chatSettings.model,
      role: "user",
      sequence_number: chatMessages.length,
      updated_at: "",
      user_id: "",
      annotation: {},
      word_count: 0
    },
    fileItems: []
  }

  let tempAssistantChatMessage: ChatMessage = {
    message: {
      chat_id: "",
      assistant_id: selectedAssistant?.id || null,
      content: "",
      created_at: "",
      id: uuidv4(),
      image_paths: [],
      model: chatSettings.model,
      role: "assistant",
      sequence_number: chatMessages.length + 1,
      updated_at: "",
      user_id: "",
      annotation: {},
      word_count: 0
    },
    fileItems: []
  }

  let newMessages = []

  if (isRegeneration) {
    const lastMessageIndex = chatMessages.length - 1
    chatMessages[lastMessageIndex].message.content = ""
    chatMessages[lastMessageIndex].message.annotation = {}
    newMessages = [...chatMessages]
  } else {
    newMessages = [
      ...chatMessages,
      tempUserChatMessage,
      tempAssistantChatMessage
    ]
  }

  setChatMessages(newMessages)

  return {
    tempUserChatMessage,
    tempAssistantChatMessage
  }
}

export const handleLocalChat = async (
  payload: ChatPayload,
  profile: Tables<"profiles">,
  chatSettings: ChatSettings,
  tempAssistantMessage: ChatMessage,
  isRegeneration: boolean,
  newAbortController: AbortController,
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setToolInUse: React.Dispatch<React.SetStateAction<string>>
) => {
  const formattedMessages = await buildFinalMessages(payload, profile, [])

  // Ollama API: https://github.com/jmorganca/ollama/blob/main/docs/api.md
  const response = await fetchChatResponse(
    process.env.NEXT_PUBLIC_OLLAMA_URL + "/api/chat",
    {
      model: chatSettings.model,
      messages: formattedMessages,
      options: {
        temperature: payload.chatSettings.temperature
      }
    },
    false,
    newAbortController,
    setIsGenerating,
    setChatMessages
  )

  return await processResponse(
    response,
    isRegeneration
      ? payload.chatMessages[payload.chatMessages.length - 1]
      : tempAssistantMessage,
    false,
    newAbortController,
    setFirstTokenReceived,
    setChatMessages,
    setToolInUse
  )
}

export const handleToolsChat = async (
  payload: ChatPayload,
  profile: Tables<"profiles">,
  tempAssistantChatMessage: ChatMessage,
  isRegeneration: boolean,
  newAbortController: AbortController,
  chatImages: MessageImage[],
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setToolInUse: React.Dispatch<React.SetStateAction<string>>,
  selectedTools: Tables<"tools">[],
  supportsStreaming = false,
  setResponseTimeToFirstToken?: React.Dispatch<React.SetStateAction<number>>,
  setResponseTimeTotal?: React.Dispatch<React.SetStateAction<number>>,
  setResponseTokensTotal?: React.Dispatch<React.SetStateAction<number>>,
  setRequestTokensTotal?: React.Dispatch<React.SetStateAction<number>>
) => {
  // setToolInUse("plugins")

  const startTime = Date.now()

  const { finalMessages: formattedMessages, usedTokens } =
    await buildFinalMessages(payload, profile!, chatImages)

  setRequestTokensTotal?.(usedTokens)

  const response = await fetchChatResponse(
    supportsStreaming ? "/api/chat/tools-stream" : "/api/chat/tools",
    {
      chatSettings: payload.chatSettings,
      messages: formattedMessages,
      selectedTools
    },
    true,
    newAbortController,
    setIsGenerating,
    setChatMessages
  )

  setToolInUse("none")
  return await processResponse(
    response,
    isRegeneration
      ? payload.chatMessages[payload.chatMessages.length - 1]
      : tempAssistantChatMessage,
    true,
    newAbortController,
    setFirstTokenReceived,
    setChatMessages,
    setToolInUse,
    selectedTools,
    setResponseTimeToFirstToken,
    setResponseTimeTotal,
    setResponseTokensTotal,
    startTime
  )
}

export const handleHostedChat = async (
  payload: ChatPayload,
  profile: Tables<"profiles">,
  modelData: LLM,
  tempAssistantChatMessage: ChatMessage,
  isRegeneration: boolean,
  newAbortController: AbortController,
  newMessageImages: MessageImage[],
  chatImages: MessageImage[],
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setToolInUse: React.Dispatch<React.SetStateAction<string>>,
  setResponseTimeToFirstToken?: React.Dispatch<React.SetStateAction<number>>,
  setResponseTimeTotal?: React.Dispatch<React.SetStateAction<number>>,
  setResponseTokensTotal?: React.Dispatch<React.SetStateAction<number>>,
  setRequestTokensTotal?: React.Dispatch<React.SetStateAction<number>>
) => {
  const provider =
    modelData.provider === "openai" && profile.use_azure_openai
      ? "azure"
      : modelData.provider

  let formattedMessages = []
  let usedTokens = 0

  if (provider === "google") {
    ;({ finalMessages: formattedMessages, usedTokens } =
      await buildGoogleGeminiFinalMessages(payload, profile, newMessageImages))
  } else if (provider === "anthropic") {
    ;({ finalMessages: formattedMessages, usedTokens } =
      await buildClaudeFinalMessages(payload, profile, chatImages))
  } else {
    ;({ finalMessages: formattedMessages, usedTokens } =
      await buildFinalMessages(payload, profile, chatImages))
  }

  const apiEndpoint =
    provider === "custom" ? "/api/chat/custom" : `/api/chat/${provider}`

  const requestBody = {
    chatSettings: payload.chatSettings,
    messages: formattedMessages,
    customModelId: provider === "custom" ? modelData.hostedId : ""
  }

  setRequestTokensTotal?.(usedTokens)

  const startTime = Date.now()

  const response = await fetchChatResponse(
    apiEndpoint,
    requestBody,
    true,
    newAbortController,
    setIsGenerating,
    setChatMessages
  )

  return await processResponse(
    response,
    isRegeneration
      ? payload.chatMessages[payload.chatMessages.length - 1]
      : tempAssistantChatMessage,
    true,
    newAbortController,
    setFirstTokenReceived,
    setChatMessages,
    setToolInUse,
    [],
    setResponseTimeToFirstToken,
    setResponseTimeTotal,
    setResponseTokensTotal,
    startTime
  )
}

export const fetchChatResponse = async (
  url: string,
  body: object,
  isHosted: boolean,
  controller: AbortController,
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
) => {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    signal: controller.signal
  })

  if (!response.ok) {
    if (response.status === 404 && !isHosted) {
      toast.error(
        "Model not found. Make sure you have it downloaded via Ollama."
      )
    }

    if (response.status === 429) {
      toast.warning(
        "You are sending too many messages. Please try again in a few minutes."
      )
    }

    const errorData = await response.json()

    toast.error(errorData.message)

    setIsGenerating(false)
    setChatMessages(prevMessages => prevMessages.slice(0, -2))
  }

  return response
}

export const processResponse = async (
  response: Response,
  lastChatMessage: ChatMessage,
  isHosted: boolean,
  controller: AbortController,
  setFirstTokenReceived: React.Dispatch<React.SetStateAction<boolean>>,
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setToolInUse: React.Dispatch<React.SetStateAction<string>>,
  selectedTools: Tables<"tools">[] = [],
  setResponseTimeToFirstToken?: React.Dispatch<React.SetStateAction<number>>,
  setResponseTimeTotal?: React.Dispatch<React.SetStateAction<number>>,
  setResponseTokensTotal?: React.Dispatch<React.SetStateAction<number>>,
  startTime = Date.now()
) => {
  let fullText = ""
  let contentToAdd = ""
  let data: any = null

  let chunks: string[] = []

  if (response.body) {
    await consumeReadableStream(
      response.body,
      chunk => {
        setResponseTimeToFirstToken?.(prev => {
          if (prev === 0) {
            return (Date.now() - startTime) / 1000
          }
          return prev
        })
        setFirstTokenReceived(true)
        setToolInUse("none")

        try {
          contentToAdd = isHosted
            ? chunk
            : // Ollama's streaming endpoint returns new-line separated JSON
              // objects. A chunk may have more than one of these objects, so we
              // need to split the chunk by new-lines and handle each one
              // separately.
              chunk
                .trimEnd()
                .split("\n")
                .reduce(
                  (acc, line) => acc + JSON.parse(line).message.content,
                  ""
                )

          if (contentToAdd === "") {
            return
          }

          if (selectedTools.length > 0) {
            chunks.push(contentToAdd)
            if (chunk[chunk.length - 1] !== "\n") {
              return
            }

            const streamParts = chunks
              .join("")
              .split("\n")
              .filter(x => x !== "")
              .map(parseDataStream)
            chunks = []

            for (const { text, data: newData } of streamParts) {
              if (newData) {
                data = newData
              }
              contentToAdd = text
              fullText += text
            }
          } else {
            fullText += contentToAdd
          }
        } catch (error) {
          console.error("Error parsing JSON:", error)
        }

        setResponseTimeTotal?.(prev => (Date.now() - startTime) / 1000)

        setChatMessages(prev =>
          prev.map(chatMessage => {
            if (chatMessage.message.id === lastChatMessage.message.id) {
              const updatedChatMessage: ChatMessage = {
                message: {
                  ...chatMessage.message,
                  content: fullText,
                  annotation: data
                },
                fileItems: chatMessage.fileItems
              }

              return updatedChatMessage
            }

            return chatMessage
          })
        )
      },
      controller.signal
    )

    function findSkipTokenCount(
      data: { [key: string]: { skipTokenCount: boolean } }[]
    ): boolean {
      if (!data) return false

      return data.some(x => {
        for (const key in x) {
          if (x[key].skipTokenCount) {
            return true
          }
        }
      })
    }

    if (setResponseTokensTotal) {
      setResponseTokensTotal(prev => {
        if (!findSkipTokenCount(data)) {
          return prev + encode(fullText).length
        }
        return prev
      })
    }

    return {
      generatedText: fullText,
      data
    }
  } else {
    throw new Error("Response body is null")
  }
}

export const handleCreateChat = async (
  chatSettings: ChatSettings,
  profile: Tables<"profiles">,
  selectedWorkspace: Tables<"workspaces">,
  messageContent: string,
  selectedAssistant: Tables<"assistants">,
  newMessageFiles: ChatFile[],
  selectedTools: Tables<"tools">[],
  setSelectedChat: React.Dispatch<React.SetStateAction<Tables<"chats"> | null>>,
  setChats: React.Dispatch<React.SetStateAction<Tables<"chats">[]>>,
  setChatFiles: React.Dispatch<React.SetStateAction<ChatFile[]>>,
  setSelectedTools: React.Dispatch<React.SetStateAction<Tables<"tools">[]>>
) => {
  const createdChat = await createChat({
    user_id: profile.user_id,
    workspace_id: selectedWorkspace.id,
    assistant_id: selectedAssistant?.id || null,
    context_length: chatSettings.contextLength,
    include_profile_context: chatSettings.includeProfileContext,
    include_workspace_instructions: chatSettings.includeWorkspaceInstructions,
    model: chatSettings.model,
    name: messageContent.substring(0, 100),
    prompt: chatSettings.prompt,
    temperature: chatSettings.temperature,
    embeddings_provider: chatSettings.embeddingsProvider
  })

  await createChatFiles(
    newMessageFiles.map(file => ({
      user_id: profile.user_id,
      chat_id: createdChat.id,
      file_id: file.id
    }))
  )

  setChats(chats => [createdChat, ...chats])
  setSelectedTools(selectedTools)
  setSelectedChat(createdChat)
  setChatFiles(prev => [...prev, ...newMessageFiles])

  return createdChat
}

export const handleCreateMessages = async (
  chatMessages: ChatMessage[],
  currentChat: Tables<"chats">,
  profile: Tables<"profiles">,
  modelData: LLM,
  messageContent: string,
  generatedText: string,
  newMessageImages: MessageImage[],
  isRegeneration: boolean,
  retrievedFileItems: Tables<"file_items">[],
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setChatFileItems: React.Dispatch<
    React.SetStateAction<Tables<"file_items">[]>
  >,
  setChatImages: React.Dispatch<React.SetStateAction<MessageImage[]>>,
  selectedAssistant: Tables<"assistants"> | null,
  data: any,
  updateState = true
) => {
  const finalUserMessage: TablesInsert<"messages"> = {
    chat_id: currentChat.id,
    assistant_id: null,
    user_id: profile.user_id,
    content: messageContent,
    model: modelData.modelId,
    role: "user",
    sequence_number: chatMessages.length,
    image_paths: [],
    annotation: {}
  }

  const finalAssistantMessage: TablesInsert<"messages"> = {
    chat_id: currentChat.id,
    assistant_id: selectedAssistant?.id || null,
    user_id: profile.user_id,
    content: generatedText,
    model: modelData.modelId,
    role: "assistant",
    sequence_number: chatMessages.length + 1,
    image_paths: [],
    annotation: data
  }

  const cleanGeneratedText = generatedText.trim()

  if (isRegeneration && cleanGeneratedText) {
    const lastStartingMessage = chatMessages[chatMessages.length - 1].message

    const updatedMessage = await updateMessage(lastStartingMessage.id, {
      ...lastStartingMessage,
      content: cleanGeneratedText
    })

    chatMessages[chatMessages.length - 1].message = updatedMessage

    setChatMessages([...chatMessages])
  } else {
    const createdMessages = cleanGeneratedText
      ? await createMessages([finalUserMessage, finalAssistantMessage])
      : await createMessages([finalUserMessage])

    const uploadPromises = newMessageImages
      .filter(obj => obj.file !== null)
      .map(obj => {
        const filePath = `${profile.user_id}/${currentChat.id}/${createdMessages[0].id}/${uuidv4()}`
        return uploadMessageImage(filePath, obj.file as File).catch(error => {
          console.error(`Failed to upload image at ${filePath}:`, error)
          return null
        })
      })

    const paths = (await Promise.all(uploadPromises)).filter(
      Boolean
    ) as string[]

    setChatImages(prevImages => [
      ...prevImages,
      ...newMessageImages.map((obj, index) => ({
        ...obj,
        messageId: createdMessages[0].id,
        path: paths[index]
      }))
    ])

    const updatedMessage = await updateMessage(createdMessages[0].id, {
      ...createdMessages[0],
      image_paths: paths
    })

    if (cleanGeneratedText) {
      await createMessageFileItems(
        retrievedFileItems.map(fileItem => {
          return {
            user_id: profile.user_id,
            message_id: createdMessages[1].id,
            file_item_id: fileItem.id
          }
        })
      )
    }

    const finalChatMessages = [
      ...chatMessages,
      {
        message: updatedMessage,
        fileItems: []
      },
      ...(cleanGeneratedText
        ? [
            {
              message: createdMessages[1],
              fileItems: retrievedFileItems.map(fileItem => fileItem.id)
            }
          ]
        : [])
    ]

    setChatFileItems(prevFileItems => {
      const newFileItems = retrievedFileItems.filter(
        fileItem => !prevFileItems.some(prevItem => prevItem.id === fileItem.id)
      )

      return [...prevFileItems, ...newFileItems]
    })

    if (updateState) {
      setChatMessages(finalChatMessages)
    }
  }
}
