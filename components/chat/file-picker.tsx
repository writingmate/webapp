import { ChatbotUIContext } from "@/context/context"
import { Tables } from "@/supabase/types"
import { IconBooks, IconUpload } from "@tabler/icons-react"
import React, { FC, useContext, useEffect, useRef } from "react"
import { FileIcon } from "../ui/file-icon"
import { defaultItemRenderer, Picker } from "@/components/picker/picker"
import { Input } from "@/components/ui/input"
import { useSelectFileHandler } from "@/components/chat/chat-hooks/use-select-file-handler"

interface FilePickerProps {
  isOpen: boolean
  searchQuery: string
  onOpenChange: (isOpen: boolean) => void
  selectedFileIds: string[]
  selectedCollectionIds: string[]
  onSelectFile: (file: Tables<"files">) => void
  onSelectCollection: (collection: Tables<"collections">) => void
  isFocused: boolean
}

export const FilePicker: FC<FilePickerProps> = ({
  isOpen,
  searchQuery,
  onOpenChange,
  selectedFileIds,
  selectedCollectionIds,
  onSelectFile,
  onSelectCollection,
  isFocused
}) => {
  const { files, collections, setIsFilePickerOpen } =
    useContext(ChatbotUIContext)

  const itemsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (isFocused && itemsRef.current[0]) {
      itemsRef.current[0].focus()
    }
  }, [isFocused])

  const filteredFiles = files.filter(
    file =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedFileIds.includes(file.id)
  )

  const filteredCollections = collections.filter(
    collection =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedCollectionIds.includes(collection.id)
  )

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
  }

  const handleSelectFile = (file: Tables<"files">) => {
    onSelectFile(file)
    handleOpenChange(false)
  }

  const handleSelectCollection = (collection: Tables<"collections">) => {
    onSelectCollection(collection)
    handleOpenChange(false)
  }

  const { filesToAccept, handleSelectDeviceFile, isUploading } =
    useSelectFileHandler()

  const getKeyDownHandler =
    (index: number, type: "file" | "collection", item: any) =>
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault()
        setIsFilePickerOpen(false)
      } else if (e.key === "Backspace") {
        e.preventDefault()
      } else if (e.key === "Enter") {
        e.preventDefault()

        if (type === "file") {
          handleSelectFile(item)
        } else {
          handleSelectCollection(item)
        }
      } else if (
        (e.key === "Tab" || e.key === "ArrowDown") &&
        !e.shiftKey &&
        index === filteredFiles.length + filteredCollections.length - 1
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

  const ref = useRef<HTMLInputElement>(null)

  return (
    <>
      <Input
        type="file"
        accept={filesToAccept}
        onChange={e => {
          if (isUploading) return
          if (e.target.files?.length) {
            handleSelectDeviceFile(e.target.files[0])
            handleOpenChange(false)
          }
        }}
        className={"hidden"}
        ref={ref}
      />
      <Picker
        isOpen={isOpen}
        items={[...filteredFiles, ...filteredCollections]}
        focusItem={isFocused}
        setIsOpen={handleOpenChange}
        command={searchQuery}
        iconRenderer={item => {
          if ("type" in item) {
            return (
              <FileIcon
                type={(item as Tables<"files">).type}
                size={24}
                stroke={1.5}
              />
            )
          } else {
            return <IconBooks size={24} stroke={1.5} />
          }
        }}
        handleSelectItem={item => {
          if ("type" in item) {
            handleSelectFile(item as Tables<"files">)
          } else {
            handleSelectCollection(item)
          }
        }}
        actions={[
          {
            icon: <IconUpload size={20} stroke={1.5} />,
            label: "Upload file",
            description: "Upload a file from your computer",
            onClick: () => ref.current?.click()
          }
        ]}
      />
    </>
  )
}
