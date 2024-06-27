"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  IconCopy,
  IconEdit,
  IconMessageCirclePlus,
  IconTrash
} from "@tabler/icons-react"
import { SidebarDeleteItem } from "@/components/sidebar2/items/all/sidebar-delete-item"
import { useAuth } from "@/context/auth"
import { useEffect, useState } from "react"
import { Tables } from "@/supabase/types"
import { useRouter } from "next/navigation"
import { deleteAssistant, getAssistantById } from "@/db/assistants"
import { AssistantIcon } from "@/components/assistants/assistant-icon"
import { parseIdFromSlug, slugify } from "@/db/lib/slugify"

export default function AssistantDetailsPage({
  params: { id }
}: {
  params: { id: string }
}) {
  const [item, setItem] = useState<Tables<"assistants"> | null>()
  const { user } = useAuth()
  const [open, setOpen] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (id) {
      getAssistantById(parseIdFromSlug(id)).then(assistant => {
        setItem(assistant)
      })
    }
  }, [id])

  function onOpenChange() {
    router.back()
  }

  if (!item) {
    return
  }

  const myItem = item?.user_id === user?.id

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"md:w-[500px] lg:w-[600px] xl:w-[700px]"}>
        <DialogHeader
          className={
            "relative flex w-full flex-row items-center justify-between"
          }
        >
          <DialogTitle
            className={
              "flex w-full flex-col items-center justify-center space-y-4"
            }
          >
            <AssistantIcon
              size={70}
              className={"border-input size-24 rounded-md border"}
              assistant={item}
            />
            <div>{item.name}</div>
          </DialogTitle>
          <div className={"absolute right-0 top-0 flex space-x-1"}>
            {myItem && (
              <Button variant={"outline"} size={"xs"}>
                <Link href={`/a/${slugify(item)}/edit`}>
                  <IconEdit size={18} stroke={1.5} />
                </Link>
              </Button>
            )}
            {myItem && (
              <SidebarDeleteItem
                onDelete={item => deleteAssistant(item.id)}
                item={item}
                contentType={"assistants"}
                trigger={
                  <Button variant={"destructive"} size={"xs"}>
                    <IconTrash size={18} stroke={1.5} />
                  </Button>
                }
              />
            )}
          </div>
        </DialogHeader>
        <div
          className={
            "text-foreground flex w-full flex-col space-y-4 text-center text-sm"
          }
        >
          {item.description}
        </div>
        <Button
          size={"lg"}
          onClick={() => {
            router.replace(`/a/${slugify(item)}`)
          }}
        >
          <IconMessageCirclePlus size={24} stroke={1.5} />
          <div>Start Chatting</div>
        </Button>
      </DialogContent>
    </Dialog>
  )
}
