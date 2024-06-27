import { FilePreview } from "@/components/ui/file-preview"
import { forwardRef, HTMLAttributes, ImgHTMLAttributes, useState } from "react"

const ImageWithPreview = forwardRef<
  HTMLImageElement,
  ImgHTMLAttributes<HTMLImageElement>
>(({ src, ...props }, ref) => {
  const [showImagePreview, setShowImagePreview] = useState(false)

  return (
    <>
      <img
        ref={ref}
        onClick={() => setShowImagePreview(true)}
        className="w-1/2 rounded-md"
        src={src}
        {...props}
      />
      {showImagePreview && (
        <FilePreview
          type="image"
          item={{
            messageId: "",
            path: "",
            base64: "",
            url: src as string,
            file: null
          }}
          isOpen={showImagePreview}
          onOpenChange={(isOpen: boolean) => {
            setShowImagePreview(isOpen)
          }}
        />
      )}
    </>
  )
})

ImageWithPreview.displayName = "ImageWithPreview"

export { ImageWithPreview }
