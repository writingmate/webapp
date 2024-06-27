"use client"

import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes/dist/types"
import { FC } from "react"
import { AuthProvider } from "@/context/auth"

export const Providers: FC<ThemeProviderProps> = ({ children, ...props }) => {
  return (
    <NextThemesProvider {...props}>
      <TooltipProvider>
        {/*<AI>*/}
        <AuthProvider>{children}</AuthProvider>
        {/*</AI>*/}
      </TooltipProvider>
    </NextThemesProvider>
  )
}
