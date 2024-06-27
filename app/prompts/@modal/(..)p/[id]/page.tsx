"use client"
import { getPromptById } from "@/db/prompts"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { getCurrentUser } from "@/lib/supabase/browser-client"
import { toast } from "sonner"
import { IconCopy, IconEdit, IconTrash } from "@tabler/icons-react"
import { SidebarDeleteItem } from "@/components/sidebar2/items/all/sidebar-delete-item"
import { copyPrompt, deletePrompt } from "@/app/prompts/actions"
import { useAuth } from "@/context/auth"
import { useEffect, useState } from "react"
import { Tables } from "@/supabase/types"
import { useRouter } from "next/navigation"
import { MessageMarkdown } from "@/components/messages/message-markdown"
import { parseIdFromSlug, slugify } from "@/db/lib/slugify"

export default function PromptsPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const { user } = useAuth()
  const [open, setOpen] = useState(true)
  const [prompt, setPrompt] = useState<Tables<"prompts"> | null>()
  const router = useRouter()

  function onOpenChange() {
    // TODO: Implement router.back()
    router.back()
  }

  useEffect(() => {
    if (id) {
      getPromptById(parseIdFromSlug(id))
        .then(setPrompt)
        .catch(() => {
          toast.error("Unable to fetch prompt")
        })
    }
  }, [id])

  async function handleCopyPrompt() {
    if (!prompt) {
      return
    }
    copyPrompt(prompt)
      .then(() => {
        toast.info("Prompt copied successfully")
        router.push("/prompts/Your Prompts")
        setOpen(false)
      })
      .catch(error => {
        toast.error(error.message)
      })
  }

  if (!prompt) {
    return
  }

  const myPrompt = prompt?.user_id === user?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"md:w-[500px] lg:w-[600px] xl:w-[700px]"}>
        <DialogHeader className={"flex flex-row items-center justify-between"}>
          <DialogTitle>
            {prompt.icon}
            {"  "}
            {prompt.name}{" "}
          </DialogTitle>
          <div className={"flex space-x-1"}>
            {myPrompt && (
              <Button variant={"outline"} size={"xs"}>
                <Link href={`/p/${slugify(prompt)}/edit`}>
                  <IconEdit size={18} stroke={1.5} />
                </Link>
              </Button>
            )}
            {myPrompt && (
              <SidebarDeleteItem
                onDelete={item => deletePrompt(item as Tables<"prompts">)}
                item={prompt}
                contentType={"prompts"}
                trigger={
                  <Button variant={"destructive"} size={"xs"}>
                    <IconTrash size={18} stroke={1.5} />
                  </Button>
                }
              />
            )}
            {!myPrompt && (
              <Button
                onClick={handleCopyPrompt}
                variant={"outline"}
                size={"xs"}
              >
                <IconCopy size={18} stroke={1.5} />
              </Button>
            )}
            <Button size={"xs"}>
              <Link href={`/chat?prompt_id=${slugify(prompt)}`}>
                Use this prompt
              </Link>
            </Button>
          </div>
        </DialogHeader>
        <div className={"text-foreground flex flex-col space-y-4 text-sm"}>
          <div className={"flex flex-col space-y-2"}>
            <Label>Description</Label>
            <div>{prompt.description}</div>
          </div>
          <div className={"flex flex-col space-y-2"}>
            <Label>Prompt</Label>
            <div className={"bg-accent w-full overflow-x-auto rounded-md p-3"}>
              <MessageMarkdown
                className={"max-w-md text-sm"}
                content={prompt.content}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
