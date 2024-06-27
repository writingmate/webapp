import { ContentType } from "@/types"
import { IconColumns2, IconRobotFace, IconTerminal2 } from "@tabler/icons-react"
import { FC, useContext, useEffect } from "react"
import { ChatbotUIContext } from "@/context/context"
import { cn } from "@/lib/utils"
import { SidebarTopLevelLink } from "@/components/sidebar2/sidebar-top-level-link"
import { usePathname } from "next/navigation"

export const SIDEBAR_ICON_SIZE = 20

interface SidebarTopLevelLinksProps {
  className?: string
  contentType: ContentType
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarTopLevelLinks: FC<SidebarTopLevelLinksProps> = ({
  className
}) => {
  const { selectedWorkspace, files, prompts, assistants, folders } =
    useContext(ChatbotUIContext)

  const pathname = usePathname()

  const menuItems = [
    {
      icon: <IconRobotFace size={SIDEBAR_ICON_SIZE} stroke={1.5} />,
      label: "Assistants",
      href: `/assistants`,
      target: "_self"
    },
    {
      icon: <IconTerminal2 size={SIDEBAR_ICON_SIZE} stroke={1.5} />,
      label: "Prompts",
      href: `/prompts`,
      target: "_self"
    },
    {
      icon: <IconColumns2 size={SIDEBAR_ICON_SIZE} stroke={1.5} />,
      label: "Compare models",
      href: `/splitview`,
      target: "_blank"
    }
  ]

  return (
    <div
      className={cn("z-10 mb-2 flex flex-col border-b pb-2 text-sm", className)}
    >
      {menuItems.map((item, index) => (
        <SidebarTopLevelLink
          href={item.href}
          key={index}
          icon={item.icon}
          label={item.label}
          target={item.target}
          className={pathname === item.href ? "bg-accent" : ""}
        />
      ))}
    </div>
  )
}
