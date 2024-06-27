"use client"
import { SidebarUpdateItem } from "@/components/sidebar2/items/all/sidebar-update-item"
import React, { useEffect, useState } from "react"
import { getPromptById, updatePrompt } from "@/db/prompts"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { PROMPT_NAME_MAX } from "@/db/limits"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { Tables } from "@/supabase/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { parseIdFromSlug } from "@/db/lib/slugify"
import { EmojiEditor } from "@/components/prompts/emoji-editor"

export default function EditPromptPage({
  params: { id }
}: {
  params: { id: string }
}) {
  useEffect(() => {
    if (id) {
      getPromptById(parseIdFromSlug(id)).then(prompt => {
        setPrompt(prompt)
        setContent(prompt.content)
        setName(prompt.name)
        setIcon(prompt.icon || "✍️")
        setSharing(prompt.sharing)
      })
    }
  }, [id])

  const [prompt, setPrompt] = useState<Tables<"prompts"> | null>()
  const [sharing, setSharing] = useState("private")
  const [icon, setIcon] = useState("✍️")
  const [name, setName] = useState(prompt?.name)
  const [content, setContent] = useState(prompt?.content)
  const [isTyping, setIsTyping] = useState(false)

  const renderInputs = () => (
    <>
      <div className="space-y-2">
        <Label>Name</Label>

        <div className={"flex space-x-2"}>
          <EmojiEditor emoji={icon} onEmojiChange={setIcon} />
          <Input
            placeholder="Prompt name..."
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={PROMPT_NAME_MAX}
            onCompositionStart={() => setIsTyping(true)}
            onCompositionEnd={() => setIsTyping(false)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Prompt</Label>

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

  if (!prompt) {
    return null
  }

  return (
    <SidebarUpdateItem
      isOpen={true}
      item={prompt!}
      isActive={false}
      isHovering={true}
      isTyping={isTyping}
      contentType={"prompts"}
      updateState={{
        name,
        content,
        sharing,
        icon
      }}
      renderInputs={renderInputs}
    >
      <></>
    </SidebarUpdateItem>
  )
}
