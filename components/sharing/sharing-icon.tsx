import { IconLock, IconWorld } from "@tabler/icons-react"

export function SharingIcon({
  item
}: {
  item: { sharing: "private" | "public" }
}) {
  return (
    <div className={"text-foreground/70 absolute right-4 top-4"}>
      {item.sharing === "private" && <IconLock size={18} stroke={1.5} />}
      {item.sharing === "public" && <IconWorld size={18} stroke={1.5} />}
    </div>
  )
}
