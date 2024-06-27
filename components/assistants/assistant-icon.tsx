import Image from "next/image"
import { IconRobotFace } from "@tabler/icons-react"
import { Tables } from "@/supabase/types"
import { cn } from "@/lib/utils"
import { getAssistantPublicImageUrl } from "@/db/storage/assistant-images"
import { getColorById } from "@/lib/color-by-id"

export function AssistantIcon({
  assistant,
  size = 28,
  className = ""
}: {
  assistant: Tables<"assistants">
  size?: number
  className?: string
}) {
  // const { assistantImages } = useContext(ChatbotUIContext)
  const imageUrl = assistant.image_path
    ? getAssistantPublicImageUrl(assistant.image_path)
    : ""

  const backgroundColor = imageUrl ? "" : getColorById(assistant.id)

  return (
    <div
      className={cn(
        `flex shrink-0 items-center justify-center overflow-hidden rounded`,
        `w-[${size}px] h-[${size}px]`,
        className,
        backgroundColor
      )}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={assistant.name}
          width={size}
          placeholder={`data:image/svg+xml;utf8,<svg><text x='10' y='20' font-size='20' fill='black'>${assistant.name}</text></svg>`}
          height={size}
        />
      ) : (
        <IconRobotFace
          size={size - 2}
          stroke={1.5}
          className="text-foreground"
        />
      )}
    </div>
  )
}
