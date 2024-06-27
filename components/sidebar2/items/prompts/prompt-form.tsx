import { Label } from "@/components/ui/label"
import { EmojiEditor } from "@/components/prompts/emoji-editor"
import { Input } from "@/components/ui/input"
import { PROMPT_NAME_MAX } from "@/db/limits"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import React from "react"

export function PromptForm({
  icon,
  setIcon,
  name,
  setName,
  content,
  setContent,
  sharing,
  setIsTyping,
  setSharing
}: {
  icon: string
  setIcon: (icon: string) => void
  name: string
  setName: (name: string) => void
  content: string
  setContent: (content: string) => void
  sharing: string
  setIsTyping: (isTyping: boolean) => void
  setSharing: (sharing: string) => void
}) {
  return (
    <>
      <div className="space-y-2">
        <Label>Name</Label>

        <div className={"flex space-x-2"}>
          <EmojiEditor emoji={icon} onEmojiChange={setIcon} />
          <Input
            placeholder="Prompt name..."
            value={name}
            required={true}
            onChange={e => setName(e.target.value)}
            maxLength={PROMPT_NAME_MAX}
            onCompositionStart={() => setIsTyping(true)}
            onCompositionEnd={() => setIsTyping(false)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Prompt</Label>
        <div className="text-foreground/80 text-sm">
          You can use template{" "}
          <span className={"text-foreground font-mono text-xs"}>
            {"{{"}variables{"}}"}
          </span>
          .
        </div>
        <TextareaAutosize
          placeholder="Prompt..."
          value={content || ""}
          onValueChange={setContent}
          minRows={6}
          maxRows={20}
          onCompositionStart={() => setIsTyping(true)}
          onCompositionEnd={() => setIsTyping(false)}
        />
      </div>

      <div className="space-y-2">
        <Label>Sharing</Label>

        <Select value={sharing} onValueChange={setSharing}>
          <SelectTrigger>
            {sharing === "public" ? "Public" : "Private"}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={"public"}>
              <SelectValue>Public</SelectValue>
            </SelectItem>
            <SelectItem value={"private"}>
              <SelectValue>Private</SelectValue>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
