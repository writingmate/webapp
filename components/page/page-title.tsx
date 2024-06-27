// header component wuth tailwind css

import React from "react"
import { cn } from "@/lib/utils"

type TitleProps = {
  children: React.ReactNode
  className?: string
}

const Title = ({ children, className }: TitleProps) => {
  return (
    <h1 className={cn("text-center text-2xl font-semibold", className)}>
      {children}
    </h1>
  )
}

export default Title
