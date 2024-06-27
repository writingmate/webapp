import { createClient } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"
import { Ratelimit } from "@upstash/ratelimit";
import { kv } from "@vercel/kv";
import { Session, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from 'next/headers'

const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(100, '3600 s'),
})

async function rateLimitMiddleware(supabase: SupabaseClient, request: NextRequest) {
  const session = (await supabase.auth.getSession()).data?.session
  if (session && request.nextUrl.pathname.startsWith('/api/chat') && request.method === "POST") {
    const userId = session?.user.id
    if (userId) {
      const { success, pending, limit, reset, remaining } = await ratelimit.limit(
        [userId, request.nextUrl.pathname].join("-"),
      )

      if (!success) {
        return NextResponse.json({
          message: "You are sending too many messages. Please try again in a few minutes.",
        }, {
          status: 429,
        })
      }
    }
  }
}

async function redirectToSetupMiddleware(supabase: SupabaseClient, request: NextRequest) {
  const session = (await supabase.auth.getSession()).data?.session
  const path = request.nextUrl.pathname

  // if the user is not logged in and they are on the homepage, do nothing
  if (!session && path === "/") {
    return
  }

  // if the user is not logged in and they are not on the homepage, redirect them to the homepage
  if (!session && path !== "/") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // if the user is logged in and they are on the homepage, check if they have onboarded
  const redirectToChat = request.nextUrl.pathname === "/"

  if (!redirectToChat) {
    return
  }

  // if the user is logged in and they have not onboarded, redirect them to the setup page
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session?.user.id)
    .single()

  if (!profile) {
    throw new Error(error?.message)
  }

  if (!profile.has_onboarded) {
    return NextResponse.redirect(new URL("/setup", request.url))
  }
}

async function redirectToChat(supabase: SupabaseClient, request: NextRequest) {
  const session = (await supabase.auth.getSession()).data?.session
  if (!session) {
    return
  }

  if (request.nextUrl.pathname === "/") {

    const currentUrl = new URL(request.url)

    return NextResponse.redirect(
      new URL(`/chat?${currentUrl.searchParams.toString()}`, request.url)
    )
  }
}

type Middleware = (supabase: SupabaseClient, request: NextRequest) => Promise<NextResponse | void>

const middlewares: Middleware[] = [
  rateLimitMiddleware,
  redirectToSetupMiddleware,
  redirectToChat
]

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  for (const middleware of middlewares) {
    const result = await middleware(supabase, request)
    if (result) {
      return result
    }
  }

  return response
}

export const config = {
  matcher: "/(chat|/api/chat)?",
}
