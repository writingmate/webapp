"use client"

import { Dashboard } from "@/components/ui/dashboard"
import { ReactNode, useContext, useEffect, useState } from "react"
import { ChatbotUIChatProvider } from "@/context/chat"

interface ChatLayoutProps {
  children: ReactNode
  modal: ReactNode
}

export default function ChatLayout({ children, modal }: ChatLayoutProps) {
  return (
    <ChatbotUIChatProvider id={"one"}>
      <Dashboard>
        {modal}
        {children}
      </Dashboard>
    </ChatbotUIChatProvider>
  )
}
