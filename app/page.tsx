import { ChatUI } from "@/components/chat/chat-ui"
import { Dashboard } from "@/components/ui/dashboard"
import LoginDialog from "@/components/login/login-dialog"

export default function HomePage() {
  return (
    <>
      <Dashboard>
        <ChatUI />
      </Dashboard>
      <LoginDialog />
    </>
  )
}
