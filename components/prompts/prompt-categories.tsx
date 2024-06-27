import { Tables } from "@/supabase/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export function PromptCategories({
  categories,
  selected
}: {
  categories: Tables<"prompt_category">[]
  selected?: string
}) {
  return (
    <div className="flex w-full space-x-2 py-4">
      <Tabs value={selected} className={"bg-transparent"}>
        <TabsList className={"bg-transparent"}>
          {[...categories].map((cat, index: number) => (
            <TabsTrigger
              className={
                "data-[state=active]:border-input rounded-lg border border-transparent"
              }
              key={index}
              value={cat.name}
            >
              <Link href={`/prompts/${cat.name}`}>{cat.name}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
