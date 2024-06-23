import { Button } from "@/components/ui/button"
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard"
import {
  IconCheck,
  IconCode,
  IconCopy,
  IconDownload,
  IconPlayerPlay
} from "@tabler/icons-react"
import { FC, memo, useEffect, useRef, useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { Switch } from "@/components/ui/switch"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface MessageCodeBlockProps {
  language: string
  value: string
}

interface languageMap {
  [key: string]: string | undefined
}

export const programmingLanguages: languageMap = {
  javascript: ".js",
  python: ".py",
  java: ".java",
  c: ".c",
  cpp: ".cpp",
  "c++": ".cpp",
  "c#": ".cs",
  ruby: ".rb",
  php: ".php",
  swift: ".swift",
  "objective-c": ".m",
  kotlin: ".kt",
  typescript: ".ts",
  go: ".go",
  perl: ".pl",
  rust: ".rs",
  scala: ".scala",
  haskell: ".hs",
  lua: ".lua",
  shell: ".sh",
  sql: ".sql",
  html: ".html",
  css: ".css"
}

export const generateRandomString = (length: number, lowercase = false) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXY3456789" // excluding similar looking characters like Z, 2, I, 1, O, 0
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return lowercase ? result.toLowerCase() : result
}

export const MessageCodeBlock: FC<MessageCodeBlockProps> = memo(
  ({ language, value }) => {
    const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })

    const [execute, setExecute] = useState(false)

    const refIframe = useRef<HTMLIFrameElement>(null)

    const downloadAsFile = () => {
      if (typeof window === "undefined") {
        return
      }
      const fileExtension = programmingLanguages[language] || ".file"
      const suggestedFileName = `file-${generateRandomString(
        3,
        true
      )}${fileExtension}`
      const fileName = window.prompt("Enter file name" || "", suggestedFileName)

      if (!fileName) {
        return
      }

      const blob = new Blob([value], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.download = fileName
      link.href = url
      link.style.display = "none"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    const onCopy = () => {
      if (isCopied) return
      copyToClipboard(value)
    }

    useEffect(() => {
      const receiveMessage = (event: MessageEvent) => {
        if (event.data.type === "resize") {
          if (refIframe.current) {
            refIframe.current.style.height = event.data.height + "px"
          }
        }
      }
      window.addEventListener("message", receiveMessage)
      return () => {
        window.removeEventListener("message", receiveMessage)
      }
    }, [])

    const sendHeightJS = `
    <script>
    function sendHeight() {
      window.parent.postMessage({
        type: "resize",
        height: document.body.scrollHeight
      }, "*")
    }
    window.addEventListener('load', sendHeight);
    window.addEventListener('resize', sendHeight);
    </script>
    `

    function addScriptToHtml(html: string) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, "text/html")
      const body = doc.querySelector("body")
      if (body) {
        body.innerHTML += sendHeightJS
        return doc.documentElement.outerHTML
      }
      return html
    }

    return (
      <div className="codeblock relative w-full bg-zinc-950 font-sans">
        <div className="flex w-full items-center justify-between bg-zinc-700 px-4 text-white">
          <span className="text-xs lowercase">{language}</span>
          <div className="flex items-center space-x-1">
            <ToggleGroup
              onValueChange={value => {
                setExecute(value === "execute")
              }}
              size={"xs"}
              variant={"default"}
              type={"single"}
              value={execute ? "execute" : "code"}
            >
              <ToggleGroupItem
                value={"code"}
                className="space-x-1 text-xs text-white"
              >
                <IconCode size={16} stroke={1.5} />
                <span>Code</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value={"execute"}
                className="space-x-1 text-xs text-white"
              >
                <IconPlayerPlay size={16} stroke={1.5} />
                <span>Run</span>
              </ToggleGroupItem>
            </ToggleGroup>

            <Button
              variant="link"
              size="icon"
              className="text-white hover:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0"
              onClick={downloadAsFile}
            >
              <IconDownload size={16} />
            </Button>

            <Button
              variant="link"
              size="icon"
              className="text-xs text-white hover:bg-zinc-800 focus-visible:ring-1 focus-visible:ring-slate-700 focus-visible:ring-offset-0"
              onClick={onCopy}
            >
              {isCopied ? <IconCheck size={16} /> : <IconCopy size={16} />}
            </Button>
          </div>
        </div>
        {execute ? (
          <iframe
            ref={refIframe}
            className={"size-full min-h-[400px] border-none bg-white"}
            srcDoc={
              language === "html"
                ? addScriptToHtml(value)
                : `<script>${value}</script>${sendHeightJS}`
            }
          />
        ) : (
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            // showLineNumbers
            customStyle={{
              margin: 0,
              // width: "100%",
              background: "transparent"
            }}
            codeTagProps={{
              style: {
                fontSize: "14px",
                fontFamily: "var(--font-mono)"
              }
            }}
          >
            {value}
          </SyntaxHighlighter>
        )}
      </div>
    )
  }
)

MessageCodeBlock.displayName = "MessageCodeBlock"
