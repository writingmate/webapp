import { openapiToFunctions } from "@/lib/openapi-conversion"
import {
  platformToolDefinitions,
  platformToolFunction
} from "@/lib/platformTools/utils/platformToolsUtils"
import {
  checkApiKey,
  getServerProfile,
  validateModelAndMessageCount
} from "@/lib/server/server-chat-helpers"
import { Tables } from "@/supabase/types"
import { ChatSettings } from "@/types"
import {
  AnthropicStream,
  experimental_StreamData,
  OpenAIStream,
  StreamingTextResponse
} from "ai"
import OpenAI from "openai"
import Anthropic from "@anthropic-ai/sdk"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import {
  AnthropicFunctionCaller,
  GroqFunctionCaller,
  OpenAIFunctionCaller
} from "@/lib/tools/function-callers"
import {
  buildSchemaDetails,
  executeTool,
  prependSystemPrompt
} from "@/lib/tools/utils"

export const maxDuration = 300

export async function GET() {
  return new Response(JSON.stringify(platformToolDefinitions()), {
    headers: {
      "Content-Type": "application/json"
    }
  })
}

function getProviderCaller(model: string, profile: Tables<"profiles">) {
  const provider = LLM_LIST.find(llm => llm.modelId === model)?.provider
  if (provider === "openai") {
    checkApiKey(profile.openai_api_key, "OpenAI")

    return new OpenAIFunctionCaller(
      new OpenAI({
        apiKey: process.env.OPENAI_API_KEY || "",
        organization: process.env.OPENAI_ORGANIZATION_ID,
        baseURL: process.env.OPENAI_BASE_URL || undefined,
        maxRetries: 5
      })
    )
  }

  if (provider === "mistral") {
    checkApiKey(profile.mistral_api_key, "Mistral")
    return new OpenAIFunctionCaller(
      new OpenAI({
        apiKey: profile.mistral_api_key || "",
        baseURL: "https://api.mistral.ai/v1",
        maxRetries: 5
      })
    )
  }

  if (provider === "anthropic") {
    checkApiKey(profile.anthropic_api_key, "Anthropic")
    return new AnthropicFunctionCaller(
      new Anthropic({
        apiKey: profile.anthropic_api_key || "",
        baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
        maxRetries: 5
      })
    )
  }

  if (provider === "groq") {
    checkApiKey(profile.groq_api_key, "Groq")
    return new GroqFunctionCaller(
      new OpenAI({
        apiKey: profile.groq_api_key || "",
        baseURL: "https://api.groq.com/openai/v1",
        maxRetries: 5
      })
    )
  }

  throw new Error(`Provider not supported: ${provider}`)
}

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, selectedTools } = json as {
    chatSettings: ChatSettings
    messages: any[]
    selectedTools: Tables<"tools">[]
  }

  prependSystemPrompt(messages)

  const streamData = new experimental_StreamData()

  try {
    const profile = await getServerProfile()

    await validateModelAndMessageCount(chatSettings.model, new Date())

    const functionCallStartTime = new Date().getTime()

    const client = getProviderCaller(chatSettings.model, profile)

    const { schemaDetails, allTools } = await buildSchemaDetails(selectedTools)

    const message = await client.findFunctionCalls({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages,
      tools: allTools.length > 0 ? allTools : undefined
    })

    streamData.appendMessageAnnotation({
      toolCalls: {
        responseTime: new Date().getTime() - functionCallStartTime + ""
      }
    })

    messages.push(message)
    const toolCalls = message.tool_calls || []

    if (toolCalls.length === 0) {
      return new Response(`0:${JSON.stringify(message.content)}\n`, {
        headers: {
          "Content-Type": "application/json"
        }
      })
    }

    if (toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const functionCallStartTime = new Date().getTime()
        // Reroute to local executor for local tools
        const { result: data } = await executeTool(
          schemaDetails,
          toolCall.function as any
        )

        streamData.appendMessageAnnotation({
          [`${toolCall.function.name}`]: {
            ...data,
            requestTime: new Date().getTime() - functionCallStartTime
          }
        })

        messages.push({
          tool_call_id: toolCall.id,
          role: "tool",
          name: toolCall.function.name,
          content: JSON.stringify(data)
        })
      }
    }

    const stream = await client.createResponseStream({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages,
      tools: allTools,
      streamData
    })

    return new StreamingTextResponse(stream, {}, streamData)
  } catch (error: any) {
    console.error(error)
    const errorMessage = error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
