import { Annotation } from "@/types/annotation"
import Image from "next/image"
import { FilePreview } from "@/components/ui/file-preview"
import { useState } from "react"
import { cs } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function AnnotationImage({
  annotation
}: {
  annotation: Annotation
}) {
  const [showImagePreview, setShowImagePreview] = useState(false)

  const imageParams = annotation.imageGenerator__generateImage!

  const scale = 0.5
  let width = 0,
    height = 0

  console.log(imageParams.size)

  if (imageParams.size) {
    width = parseInt(imageParams.size?.split("x")[0]) * scale
    height = parseInt(imageParams.size?.split("x")[1]) * scale
  }

  return (
    <div
      className={cn("my-4 items-center", width > height ? "w-2/3" : "w-1/2")}
    >
      <Image
        src={imageParams.url!}
        alt={imageParams.prompt}
        width={width}
        height={height}
        style={{ width: "100%", height: "auto" }}
        className="rounded-md"
        onClick={() => {
          setShowImagePreview(true)
        }}
      />
      {showImagePreview && (
        <FilePreview
          type="image"
          item={{
            messageId: "",
            path: "",
            base64: "",
            url: imageParams.url,
            file: null
          }}
          isOpen={showImagePreview}
          onOpenChange={(isOpen: boolean) => {
            setShowImagePreview(isOpen)
          }}
        />
      )}
    </div>
  )
}
