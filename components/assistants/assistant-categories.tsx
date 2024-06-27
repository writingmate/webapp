import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Tables } from "@/supabase/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AssistantCategories({
  categories,
  selected
}: {
  categories: {
    name: string
    value: string
  }[]
  selected?: string
}) {
  return (
    <div className="flex w-full space-x-2 py-4">
      <Tabs value={selected} className={"bg-transparent"}>
        <TabsList className={"bg-transparent"}>
          {[...categories].map((cat, index: number) => (
            <TabsTrigger
              value={cat.value}
              className={
                "data-[state=active]:border-input rounded-lg border border-transparent"
              }
              key={index}
            >
              <Link href={"/assistants/" + cat.value}>{cat.name}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
