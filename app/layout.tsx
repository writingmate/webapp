import { Toaster } from "@/components/ui/sonner"
import { GlobalState } from "@/components/utility/global-state"
import { Providers } from "@/components/utility/providers"
import TranslationsProvider from "@/components/utility/translations-provider"
import initTranslations from "@/lib/i18n"
import { Database } from "@/supabase/types"
import { createServerClient } from "@supabase/ssr"
import { Metadata, Viewport } from "next"
import { DM_Sans, Inter } from "next/font/google"
import { cookies } from "next/headers"
import { ReactNode } from "react"
import { GoogleAnalytics, GoogleTagManager } from "@next/third-parties/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css"

const font = DM_Sans({ subsets: ["latin"] })
const APP_NAME = "ChatLabs"
const APP_DEFAULT_TITLE = "ChatLabs"
const APP_TITLE_TEMPLATE = "%s - ChatLabs"
const APP_DESCRIPTION =
  "ChatLabs is a platform for LLM and AI tinkerers. Experience more than 30 AI models in one place."

interface RootLayoutProps {
  children: ReactNode
  params: {
    locale: string
  }
}

export const metadata: Metadata = {
  applicationName: APP_NAME,
  metadataBase: new URL("https://writingmate.ai/labs/"),
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: APP_DEFAULT_TITLE
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE
    },
    description: APP_DESCRIPTION
  }
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content"
}

export default async function RootLayout({
  children,
  params: { locale }
}: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning className={"h-full"}>
      <body className={font.className + " h-full antialiased"}>
        <Providers attribute="class" defaultTheme="light">
          <Toaster richColors position="top-center" duration={3000} />
          <div className="text-foreground flex h-full flex-col items-center sm:h-screen">
            <GlobalState>{children}</GlobalState>
          </div>
        </Providers>
        {process.env.NODE_ENV === "production" && (
          <>
            <Analytics />
            <SpeedInsights />
            <GoogleAnalytics gaId="G-Y14R2TP0QH" />
            <GoogleTagManager gtmId={"GTM-5SBXJ23Q"} />
          </>
        )}
      </body>
    </html>
  )
}
