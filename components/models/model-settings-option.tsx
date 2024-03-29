import { LLM } from "@/types"
import { FC } from "react"
import { ModelIcon } from "./model-icon"
import {
  IconBrain,
  IconCurrencyDollar,
  IconEye,
  IconHistory,
  IconPuzzle,
  IconTools
} from "@tabler/icons-react"
import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { Switch } from "@/components/ui/switch"

interface ModelSettingsOption {
  model: LLM
  onSelect: (checked: boolean) => void
  selected: boolean
}

export const ModelSettingsOption: FC<ModelSettingsOption> = ({
  model,
  selected,
  onSelect
}) => {
  const { theme } = useTheme()

  return (
    <div className="flex w-full justify-start space-x-3 truncate rounded p-2">
      <div className="flex w-full items-center justify-between space-x-2">
        <div className={"relative flex items-center space-x-2"}>
          <ModelIcon provider={model.provider} width={28} height={28} />
          <div
            className={
              "text-sm " + (selected ? "font-semibold" : "font-normal")
            }
          >
            {model.modelName}
          </div>
        </div>
        <Switch checked={selected} onCheckedChange={onSelect} />
      </div>
    </div>
  )
}
