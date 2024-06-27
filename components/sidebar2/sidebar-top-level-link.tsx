import Link from "next/link"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { IconExternalLink } from "@tabler/icons-react"

type SidebarSwitchItemProps = {
  icon: React.ReactNode
  href: string
  label: string
  className?: string
  target?: string
  // active: boolean
}

export const SidebarTopLevelLink = forwardRef<
  HTMLAnchorElement,
  SidebarSwitchItemProps
>(({ icon, href, label, className, target = "_self", ...props }, ref) => {
  return (
    <Link
      ref={ref}
      prefetch={true}
      target={target}
      href={href}
      className={cn(
        "hover:bg-accent/60 flex-start focus:bg-accent group flex w-full cursor-pointer items-center rounded p-2 focus:outline-none",
        className
      )}
      {...props}
    >
      {icon}
      <div className={"ml-3 flex-1 truncate text-left text-sm"}>{label}</div>
      {target == "_blank" && (
        <IconExternalLink
          className={"text-foreground/60"}
          size={18}
          stroke={1.5}
        />
      )}
    </Link>
  )
})

SidebarTopLevelLink.displayName = "SidebarTopLevelLink"

export default SidebarTopLevelLink
