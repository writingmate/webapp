"use client"
import { forwardRef, useEffect } from "react"
import { Input, InputProps } from "@/components/ui/input"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { IconSearch } from "@tabler/icons-react"
import { SidebarSearch } from "@/components/sidebar2/sidebar-search"

const Search = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const searchParams = useSearchParams()
  const { replace } = useRouter()
  const pathname = usePathname()

  const handleSearch = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams(searchParams)
    if (query) {
      params.set("q", query)
    } else {
      params.delete("q")
    }

    replace(`${pathname}?${params.toString()}`)
  }, 300)

  return (
    <SidebarSearch
      placeholder={"Search prompts..."}
      className={"border-input h-[36px] rounded-lg border"}
      onValueChange={handleSearch}
    />
  )
})

Search.displayName = "Search"

export default Search
