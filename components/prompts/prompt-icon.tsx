import { Tables } from "@/supabase/types"
import { cn } from "@/lib/utils"
import { getColorById } from "@/lib/color-by-id"
import { IconPrompt } from "@tabler/icons-react"

export function PromptIcon({
  className,
  prompt
}: {
  className?: string
  prompt: Tables<"prompts">
}) {
  if (prompt.icon) {
    return (
      <div
        className={cn(
          "flex size-[50px] shrink-0 items-center justify-center rounded-md text-center text-3xl",
          className
        )}
      >
        {prompt.icon}
      </div>
    )
  }

  return <IconPrompt />
}
