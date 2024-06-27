import OpenAI from "openai"
import { AnthropicStream, experimental_StreamData, OpenAIStream } from "ai"
import Anthropic from "@anthropic-ai/sdk"
import ChatCompletionMessage = OpenAI.Chat.Completions.ChatCompletionMessage
import {
  FindFunctionCallsStreamParams,
  FunctionCaller
} from "@/types/function-callers"
// @ts-ignore
import { TextBlock, ToolUseBlock } from "@anthropic-ai/sdk/resources"

export class OpenAIFunctionCaller implements FunctionCaller {
  constructor(
    private readonly client: OpenAI,
    public readonly supportsFunctionCallStreaming = false
  ) {
    this.supportsFunctionCallStreaming = supportsFunctionCallStreaming
    this.client = client
  }

  async findFunctionCallsStream({
    model,
    messages,
    tools,
    onFunctionCall
  }: FindFunctionCallsStreamParams): Promise<ReadableStream> {
    if (!this.supportsFunctionCallStreaming) {
      throw new Error("This function caller does not support streaming")
    }

    const response = await this.client.chat.completions.create({
      model: model,
      messages: messages,
      tools: tools,
      tool_choice: "auto",
      stream: true
    })

    const stream = OpenAIStream(response, {
      experimental_onFunctionCall: onFunctionCall
    })

    return stream
  }

  async findFunctionCalls({
    model,
    messages,
    tools
  }: {
    model: string
    messages: any[]
    tools?: OpenAI.Chat.Completions.ChatCompletionTool[]
  }) {
    const response = await this.client.chat.completions.create({
      model: model,
      messages: messages,
      tools: tools,
      tool_choice: "auto"
    })

    return response.choices[0].message
  }

  async createResponseStream({
    model,
    messages,
    tools,
    streamData
  }: {
    model: string
    messages: any[]
    tools: OpenAI.Chat.Completions.ChatCompletionTool[]
    streamData: experimental_StreamData
  }) {
    const response = await this.client.chat.completions.create({
      model: model,
      messages,
      stream: true
    })

    return OpenAIStream(response, {
      onFinal(completion) {
        streamData.close()
      },
      experimental_streamData: true
    })
  }
}

export class AnthropicFunctionCaller implements FunctionCaller {
  constructor(private readonly client: Anthropic) {
    this.client = client
  }

  async findFunctionCallsStream({
    model,
    messages,
    tools,
    onFunctionCall
  }: FindFunctionCallsStreamParams): Promise<ReadableStream> {
    throw new Error("This function caller does not support streaming")
  }

  async findFunctionCalls({
    model,
    messages,
    tools
  }: {
    model: string
    messages: any[]
    tools?: OpenAI.Chat.Completions.ChatCompletionTool[]
  }): Promise<ChatCompletionMessage> {
    const existingSystemPrompt =
      messages.filter(x => x.role === "system")[0]?.content ?? ""

    const anthropicTools = tools?.map(tool => ({
      name: tool.function.name,
      description: tool.function.description,
      input_schema: {
        type: "object" as "object",
        // @ts-ignore
        properties: tool.function.parameters?.properties?.parameters?.properties
      }
    }))

    const response = await this.client.messages.create({
      model: model,
      messages: messages.filter(x => x.role !== "system"),
      system: existingSystemPrompt,
      max_tokens: 4096,
      tools: anthropicTools
    })

    const text: TextBlock = response.content.find(x => x.type === "text")
    const toolCalls: ToolUseBlock = response.content.find(
      x => x.type === "tool_use"
    )

    return {
      role: "assistant",
      content: text.text,
      tool_calls: [
        {
          id: toolCalls.id,
          type: "function",
          function: {
            name: toolCalls.name,
            arguments: toolCalls.input
          }
        }
      ]
    }
  }

  async createResponseStream({
    model,
    tools,
    messages,
    streamData
  }: {
    model: string
    messages: any[]
    tools: OpenAI.Chat.Completions.ChatCompletionTool[]
    streamData: experimental_StreamData
  }) {
    const existingSystemPrompt =
      messages.filter(x => x.role === "system")[0]?.content ?? ""
    const withoutSystemMessages = messages.filter(x => x.role !== "system")

    const anthropicTools = tools?.map(tool => ({
      name: tool.function.name,
      description: tool.function.description,
      input_schema: {
        type: "object" as "object",
        // @ts-ignore
        properties: tool.function.parameters?.properties?.parameters?.properties
      }
    }))

    const anthropicMessages = withoutSystemMessages.map(message => {
      if (message.role === "tool") {
        return {
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: message.tool_call_id,
              content: message.content
            }
          ]
        }
      }
      if (message.role === "assistant") {
        return {
          role: "assistant",
          content: [
            {
              type: "text",
              text: message.content
            },
            ...message.tool_calls?.map((toolCall: any) => ({
              id: toolCall.id,
              type: "tool_use",
              name: toolCall.function.name,
              input: toolCall.function.arguments
            }))
          ]
        }
      }

      return message
    })

    const response = await this.client.messages.create({
      model: model,
      tools: anthropicTools,
      system: existingSystemPrompt,
      messages: anthropicMessages,
      stream: true,
      max_tokens: 4096
    })

    // @ts-ignore
    return AnthropicStream(response, {
      onFinal(completion) {
        streamData.close()
      },
      experimental_streamData: true
    })
  }
}

export class GroqFunctionCaller extends OpenAIFunctionCaller {
  async createResponseStream({
    model,
    messages,
    tools,
    streamData
  }: {
    model: string
    messages: any[]
    tools: OpenAI.Chat.Completions.ChatCompletionTool[]
    streamData: experimental_StreamData
  }) {
    const updatedMessages = messages.map(x => {
      if (x.role === "tool") {
        return {
          role: "user",
          content: `
          You called a function named ${x.name} and got the following result. 
          Answer the user's question using this information.
      <function_results>
          <result>
          <tool_name>${x.name}</tool_name>
          <stdout>
          ${JSON.stringify(x.content)}
          </stdout>
          </result>
          </function_results>
        `
        }
      }
      return x
    })

    return super.createResponseStream({
      model,
      messages: updatedMessages,
      tools,
      streamData
    })
  }
}
