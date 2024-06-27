import { cn } from "@/lib/utils"

type PageContentProps = {
  className?: string
  children: React.ReactNode
}

export default function PageContent({ children, className }: PageContentProps) {
  return (
    <div
      className={cn(
        "container flex h-full flex-col items-center justify-start self-center py-4 pb-5",
        className
      )}
    >
      {children}
    </div>
  )
}
