import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle
} from "@/components/ui/card"
import { PromptIcon } from "@/components/prompts/prompt-icon"
import { Tables } from "@/supabase/types"
import { slugify } from "@/db/lib/slugify"

export function PromptsList({ prompts }: { prompts: Tables<"prompts">[] }) {
  return (
    <div className="grid w-full grid-cols-2 items-start justify-between gap-3 pb-6 lg:grid-cols-3">
      {prompts?.map(prompt => (
        <Link href={`/p/${slugify(prompt)}`} key={prompt.id}>
          <Card
            className={
              "hover:bg-foreground/5 border-input rounded-xl border shadow-none"
            }
          >
            <CardContent className={"relative flex space-x-3 p-4"}>
              <PromptIcon prompt={prompt} />
              <div className={"flex flex-col"}>
                <CardTitle className={"text-md line-clamp-1"}>
                  {prompt.name}
                </CardTitle>
                <CardDescription className={"line-clamp-2 text-xs"}>
                  {prompt.description}
                </CardDescription>
              </div>
              {/*<SharingIcon item={prompt as any} />*/}
            </CardContent>
          </Card>
        </Link>
      ))}
      {prompts.length === 0 && (
        <div className="col-span-3 flex h-full items-center justify-center text-center align-middle text-2xl">
          Prompts are pre-saved text inputs designed to generate specific
          responses and communicate with AI quicker. Prompts you create will be
          displayed here.
        </div>
      )}
    </div>
  )
}
