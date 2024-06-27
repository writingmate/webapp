// hook to handle arrow navigation in a list
import { useEffect, useRef, useState } from "react"

/***
 const getKeyDownHandler =
    (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Backspace") {
        e.preventDefault()
        handleOpenChange(false)
      } else if (e.key === "Enter") {
        e.preventDefault()
        handleSelectTool(tools[index])
      } else if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        !e.shiftKey &&
        index === tools.length - 1
      ) {
        e.preventDefault()
        itemsRef.current[0]?.focus()
        setHoveredTool(tools[0])
      } else if (e.key === "ArrowUp" && !e.shiftKey && index === 0) {
        // go to last element if arrow up is pressed on first element
        e.preventDefault()
        itemsRef.current[itemsRef.current.length - 1]?.focus()
        setHoveredTool(tools[itemsRef.current.length - 1])
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const prevIndex =
          index - 1 >= 0 ? index - 1 : itemsRef.current.length - 1
        itemsRef.current[prevIndex]?.focus()
        setHoveredTool(tools[prevIndex])
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIndex = index + 1 < itemsRef.current.length ? index + 1 : 0
        itemsRef.current[nextIndex]?.focus()
        setHoveredTool(tools[nextIndex])
      }
    }***/

export function useListArrowNavigation<T>(
  data: T[],
  initialIndex: number,
  onEnter?: (item: T) => void,
  onEscape?: () => void
) {
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  const [index, setIndex] = useState(initialIndex)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setIndex(prevIndex => {
          const newIndex = (prevIndex - 1 + data.length) % data.length
          console.log(
            "ArrowUp",
            newIndex,
            "itemsRef",
            itemsRef.current[newIndex]
          )
          itemsRef.current[newIndex]?.focus()
          return newIndex
        })
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setIndex(prevIndex => {
          const newIndex = (prevIndex + 1) % data.length
          console.log(
            "ArrowDown",
            newIndex,
            "itemsRef",
            itemsRef.current[newIndex]
          )
          itemsRef.current[newIndex]?.focus()
          return newIndex
        })
      } else if (e.key === "Enter") {
        e.preventDefault()
        onEnter?.(data[index])
      } else if (e.key === "Escape") {
        e.preventDefault()
        onEscape?.()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [index, itemsRef])

  return {
    itemsRef,
    index
  }
}
