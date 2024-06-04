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

export default async function PromptsPage({
  params
}: {
  params: { id: string }
}) {
  const prompt = await getPromptById(params.id)

  function onOpenChange() {
    // TODO: Implement router.back()
    window.history.back()
  }

  return (
    <Dialog open={true} onOpenChange={onOpenChange} modal={true}>
      <DialogContent>
        <DialogHeader className={"flex flex-row items-center justify-between"}>
          <DialogTitle>
            {prompt.icon}
            {"  "}
            {prompt.name}{" "}
          </DialogTitle>
          <Button type={"submit"} size={"xs"}>
            <Link href={`/chat?prompt_id=${prompt.id}`}>Use this prompt</Link>
          </Button>
        </DialogHeader>
        <DialogDescription
          className={"text-foreground flex flex-col space-y-3"}
        >
          <div className={"flex flex-col space-y-1"}>
            <Label>Description</Label>
            <div>{prompt.description}</div>
          </div>
          <div className={"flex flex-col space-y-1"}>
            <Label>Prompt</Label>
            <div className={"bg-accent overflow-hidden rounded-md p-3"}>
              <ReactMarkdown className={"overflow-auto"}>
                {prompt.content}
              </ReactMarkdown>
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
