import { ContentType } from "@/types"
import { FC, useState } from "react"
import { Input } from "../ui/input"
import { IconSearch } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface SidebarSearchProps {
  className?: string
  value?: string
  onValueChange?: Function
  placeholder?: string
}

export const SidebarSearch: FC<SidebarSearchProps> = ({
  value,
  onValueChange,
  className,
  placeholder
}) => {
  const [hasFocus, setHasFocus] = useState(false)

  return (
    <div
      className={cn(
        "bg-background focus:border-input hover:border-input focus:bg-accent group z-50 mt-2 flex h-[32px] w-full cursor-pointer items-center rounded-md border border-transparent px-2 py-1 text-sm",
        hasFocus && "border-input",
        className
      )}
    >
      <IconSearch size={20} stroke={1.5} />
      <div className={"ml-3 flex-1 truncate"}>
        <Input
          onFocus={() => setHasFocus(true)}
          onBlur={() => setHasFocus(false)}
          value={value}
          onChange={e => onValueChange?.(e.target.value)}
          placeholder={placeholder || "Search chats..."}
          className={"z-30 -ml-2 h-auto border-transparent px-2 py-0.5"}
        />
      </div>
    </div>
  )
}
