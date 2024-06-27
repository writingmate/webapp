"use client"
import { cn } from "@/lib/utils"
import mistral from "@/public/providers/mistral.png"
import groq from "@/public/providers/groq.png"
import meta from "@/public/providers/meta.png"
import perplexity from "@/public/providers/perplexity.png"
import databricks from "@/public/providers/databricks.png"
import { ModelProvider } from "@/types"
import { IconSparkles } from "@tabler/icons-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { FC, HTMLAttributes } from "react"
import { AnthropicSVG } from "../icons/anthropic-svg"
import { GoogleSVG } from "../icons/google-svg"
import { OpenAISVG } from "../icons/openai-svg"
import { parseOpenRouterModelName } from "@/lib/models/fetch-models"
import { MicrosoftSVG } from "@/components/icons/microsoft-svg"

interface ModelIconProps extends HTMLAttributes<HTMLDivElement> {
  provider: ModelProvider
  modelId?: string
  height: number
  width: number
}

export const ModelIcon: FC<ModelIconProps> = ({
  provider,
  height,
  width,
  modelId,
  ...props
}) => {
  const { theme } = useTheme()

  switch (provider as ModelProvider) {
    case "openai":
      return (
        <OpenAISVG
          className={cn(
            "rounded-sm bg-[#fff] p-1 text-black",
            props.className,
            theme === "dark" ? "bg-white" : "border-foreground/10 border-[1px]"
          )}
          width={width}
          height={height}
        />
      )
    case "mistral":
      return (
        <Image
          className={cn(
            "rounded-sm p-1",
            theme === "dark" ? "bg-white" : "border-foreground/10 border-[1px]"
          )}
          src={mistral.src}
          alt="Mistral"
          width={width}
          height={height}
        />
      )
    case "groq":
      return (
        <Image
          className={cn(
            "rounded-sm p-0",
            theme === "dark" ? "bg-white" : "border-foreground/10 border-[1px]"
          )}
          src={groq.src}
          alt="Groq"
          width={width}
          height={height}
        />
      )
    case "anthropic":
      return (
        <AnthropicSVG
          className={cn(
            "rounded-sm bg-[#fff] p-1 text-black",
            props.className,
            theme === "dark" ? "bg-white" : "border-foreground/10 border-[1px]"
          )}
          width={width}
          height={height}
        />
      )
    case "google":
      return (
        <GoogleSVG
          className={cn(
            "rounded-sm bg-[#fff] p-1 text-black",
            props.className,
            theme === "dark" ? "bg-white" : "border-foreground/10 border-[1px]"
          )}
          width={width}
          height={height}
        />
      )
    case "perplexity":
      return (
        <Image
          className={cn(
            "rounded-sm p-1",
            theme === "dark" ? "bg-white" : "border-foreground/10 border-[1px]"
          )}
          src={perplexity.src}
          alt="Perplexity"
          width={width}
          height={height}
        />
      )
    case "databricks":
      return (
        <Image
          className={cn(
            "rounded-sm p-1",
            theme === "dark" ? "bg-white" : "border-foreground/10 border-[1px]"
          )}
          src={databricks.src}
          alt="Databricks"
          width={width}
          height={height}
        />
      )
    case "microsoft":
      return (
        <MicrosoftSVG
          className={cn(
            "rounded-sm bg-[#fff] p-1 text-black",
            props.className,
            theme === "dark" ? "bg-white" : "border-foreground/10 border-[1px]"
          )}
          width={width}
          height={height}
        />
      )
    case "meta":
      return (
        <Image
          className={cn(
            "rounded-sm p-1",
            theme === "dark" ? "bg-white" : "border-foreground/10 border-[1px]"
          )}
          src={meta.src}
          alt="Meta Llama"
          width={width}
          height={height}
        />
      )
    case "openrouter":
      const { modelProvider } = parseOpenRouterModelName(modelId!)
      return (
        <ModelIcon
          provider={modelProvider as ModelProvider}
          height={height}
          width={width}
        />
      )
    default:
      return <IconSparkles size={width} />
  }
}
