import { useState } from "react"
import { Button } from "@/components/ui/button"
import data from "@emoji-mart/data"
import Picker from "@emoji-mart/react"
import { Label } from "@/components/ui/label"
import { Root as Portal } from "@radix-ui/react-portal"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"

export function EmojiEditor({
  emoji,
  onEmojiChange
}: {
  emoji: string
  onEmojiChange: (emoji: string) => void
}) {
  const [isOpened, setIsOpened] = useState(false)

  function onEmojiSelect(e: any) {
    onEmojiChange(e.native)
    setIsOpened(false)
  }

  return (
    <Popover open={isOpened} onOpenChange={setIsOpened}>
      <PopoverTrigger>
        <Button
          size={"icon"}
          className={"text-lg"}
          onClick={() => setIsOpened(true)}
          variant={"outline"}
        >
          {emoji}
        </Button>
      </PopoverTrigger>
      <PopoverContent className={"shadow-0 border-0 p-0"}>
        <Picker
          skinTonePosition={"none"}
          previewPosition={"none"}
          data={data}
          onEmojiSelect={onEmojiSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
