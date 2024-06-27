import { FC, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useClickOutside } from "@/components/chat/picker-hooks/use-click-outside"

export const defaultItemRenderer = (
  item: any,
  index: number,
  renderIcon: (item: any) => JSX.Element,
  handleSelectItem: (item: any) => void,
  handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void
) => (
  <div
    key={index}
    tabIndex={0}
    className="hover:bg-accent bg-background focus:bg-accent flex w-full cursor-pointer items-center space-x-2 p-2 text-sm focus:outline-none"
    onClick={() => handleSelectItem(item)}
    onKeyDown={handleKeyDown}
  >
    <div>{renderIcon(item)}</div>
    <div className={"text-nowrap"}>{item.name}</div>
    <div className="truncate text-nowrap text-sm opacity-50">
      {item.description}
    </div>
  </div>
)

function defaultIconRenderer(item: any) {
  if (typeof item.icon === "string") {
    return (
      <div
        className={
          "border-foreground/10 flex size-[24px] items-center justify-center rounded border-[1px]"
        }
      >
        {item.icon}
      </div>
    )
  } else {
    return <>{item.icon}</>
  }
}

interface PickerAction {
  icon: JSX.Element
  label: string
  description?: string
  onClick: () => void
}

interface PickerProps<T> {
  items: T[]
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  focusItem: T | null
  command: string
  handleSelectItem: (item: T) => void
  iconRenderer?: (item: T) => JSX.Element
  itemRenderer?: (
    item: T,
    index: number,
    handleKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void
  ) => JSX.Element
  actions?: PickerAction[]
}

export const Picker: FC<PickerProps<any>> = ({
  items,
  isOpen,
  setIsOpen,
  focusItem,
  command,
  handleSelectItem,
  iconRenderer,
  itemRenderer,
  actions
}) => {
  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (itemsRef.current[0]) {
      itemsRef.current[0].focus()
    }
  }, [])

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(command.toLowerCase())
  )

  const pickerRef = useRef<HTMLDivElement>(null)

  useClickOutside(pickerRef, () => setIsOpen(false))

  const renderIcon = iconRenderer || defaultIconRenderer

  // Use the provided itemRenderer prop if it exists, otherwise use the default
  const renderItem = itemRenderer || defaultItemRenderer

  const getKeyDownHandler =
    (index: number, item: any) => (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setIsOpen(false)
      } else if (e.key === "Backspace") {
        e.preventDefault()
      } else if (e.key === "Enter") {
        e.preventDefault()
        handleSelectItem(item)
      } else if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        !e.shiftKey &&
        index === filteredItems.length
      ) {
        e.preventDefault()
        itemsRef.current[0]?.focus()
      } else if (e.key === "ArrowUp" && !e.shiftKey && index === 0) {
        // go to last element if arrow up is pressed on first element
        e.preventDefault()
        itemsRef.current[itemsRef.current.length - 1]?.focus()
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        const prevIndex =
          index - 1 >= 0 ? index - 1 : itemsRef.current.length - 1
        itemsRef.current[prevIndex]?.focus()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        const nextIndex = index + 1 < itemsRef.current.length ? index + 1 : 0
        itemsRef.current[nextIndex]?.focus()
      }
    }

  return (
    <>
      {isOpen && (
        <div ref={pickerRef} className="relative flex flex-col text-sm">
          {actions && actions.length > 0 && (
            <div className={cn("border-input sticky top-0 flex grow border-b")}>
              {actions?.map((action, index) =>
                renderItem(
                  {
                    name: action.label,
                    description: action.description,
                    icon: action.icon
                  },
                  index,
                  () => action.icon,
                  action.onClick,
                  getKeyDownHandler(index, action)
                )
              )}
            </div>
          )}
          {filteredItems.length === 0 ? (
            <div className="text-md flex h-14 cursor-pointer items-center justify-center italic hover:opacity-50">
              No matching items.
            </div>
          ) : (
            filteredItems.map((item, index) =>
              renderItem(
                item,
                index,
                renderIcon,
                handleSelectItem,
                getKeyDownHandler(index, item)
              )
            )
          )}
        </div>
      )}
    </>
  )
}
