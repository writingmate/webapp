import { Card } from "@/components/ui/card"
import Image from "next/image"
import { Annotation, Annotation2 } from "@/types/annotation"
import { useState } from "react"

export function WebSearch({
  annotation
}: {
  annotation: Annotation | Annotation2
}) {
  const [showAll, setShowAll] = useState(false)

  let result = annotation.webScraper__googleSearch

  if (!result) {
    return null
  }

  if ("result" in result) {
    result = result.result
  }

  const { organic } = result

  return (
    <div className={"grid grid-cols-2 gap-2 md:grid-cols-4"}>
      {(showAll ? organic || [] : organic?.slice(0, 4))?.map((item, index) => {
        const hostname = new URL(item.link).hostname
        const displayHostname = hostname.replace("www.", "")
        return (
          <Card className={"flex border-0 hover:opacity-50"} key={index}>
            <a
              className="overflow-hidden p-2 text-xs"
              href={item.link}
              target={"_blank"}
            >
              <div className={"flex space-x-1"}>
                <div className="bg-background text-background flex size-[16px] items-center justify-center rounded-full text-[10px]">
                  <Image
                    src={
                      "https://www.google.com/s2/favicons?size=64&domain=" +
                      hostname
                    }
                    alt={hostname}
                    width={16}
                    height={16}
                  />
                </div>
                <div className="text-xs font-semibold">{displayHostname}</div>
              </div>
              <div className="line-clamp-3 text-ellipsis text-xs">
                {item.title}
              </div>
            </a>
          </Card>
        )
      })}
      {organic?.length > 4 &&
        (!showAll ? (
          <a
            href={"#"}
            onClick={() => setShowAll(true)}
            className="col col-span-2 w-full text-right text-xs font-semibold underline hover:opacity-50 md:col-span-4"
          >
            Show {organic?.length - 4} more
          </a>
        ) : (
          <a
            href={"#"}
            onClick={() => setShowAll(false)}
            className="col col-span-2 w-full text-right text-xs font-semibold underline hover:opacity-50 md:col-span-4"
          >
            Show less
          </a>
        ))}
    </div>
  )
}
