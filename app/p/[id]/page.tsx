import { getPromptById, getPublicPrompts } from "@/db/prompts"
import { Button } from "@/components/ui/button"
import PageContent from "@/components/page/page-content"
import PageHeader from "@/components/page/page-header"
import PageTitle from "@/components/page/page-title"
import { Label } from "@/components/ui/label"
import ReactMarkdown from "react-markdown"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { getAllModels } from "@/db/models"
import { ModelIcon } from "@/components/models/model-icon"
import { LLM, ModelProvider } from "@/types"
import { IconExternalLink } from "@tabler/icons-react"
import { WithTooltip } from "@/components/ui/with-tooltip"
import { parseIdFromSlug } from "@/db/lib/slugify"
export async function generateMetadata({ params }: { params: { id: string } }) {
  const prompt = await getPromptById(parseIdFromSlug(params.id))

  return {
    title: `${prompt.icon} ${prompt.name} - Best AI Prompt for Large Language Models`,
    description: `${prompt.description} - Use this prompt with large language models`
  }
}

export default async function PromptsPage({
  params
}: {
  params: { id: string }
}) {
  const prompt = await getPromptById(parseIdFromSlug(params.id))
  const models = await getAllModels()

  // group by provider
  const modelsByProvider = models.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = []
      }
      acc[model.provider].push(model)
      return acc
    },
    {} as Record<ModelProvider, LLM[]>
  )

  return (
    <PageContent className={"container w-full pt-10 lg:w-2/3"}>
      <PageHeader className={"flex w-full items-center justify-between"}>
        <PageTitle className={"flex items-center space-y-2"}>
          <div className={"flex flex-col justify-start space-y-2"}>
            <div>
              AI Prompt &ldquo;{prompt.icon} {prompt.name}&rdquo;
            </div>
            <div className={"flex justify-start space-x-1"}>
              {prompt.prompt_category?.map((category, index) => (
                <Badge variant={"outline"} key={index}>
                  <Link href={`/prompts/${category.name}`}>
                    {category.name}
                  </Link>
                </Badge>
              ))}
            </div>
          </div>
        </PageTitle>
        <Button type={"submit"} size={"sm"}>
          <Link href={`/chat?prompt_id=${prompt.id}`}>Use this prompt</Link>
        </Button>
      </PageHeader>
      <div className={"flex w-full flex-col space-y-6 pb-6"}>
        <div className={"flex w-full flex-col space-y-2"}>
          <Label>AI prompt description</Label>
          <div>{prompt.description}</div>
        </div>
        <div className={"flex w-full flex-col space-y-2"}>
          <Label>AI prompt</Label>
          <div className={"bg-accent overflow-hidden rounded-md p-3"}>
            <ReactMarkdown className={"overflow-auto text-sm"}>
              {prompt.content}
            </ReactMarkdown>
          </div>
        </div>
        <div className={"flex w-full flex-col space-y-6 text-sm"}>
          <Label>Try AI prompt with these large language models</Label>
          {Object.keys(modelsByProvider).map(provider => {
            return (
              <div
                key={provider}
                className={"grid grid-cols-2 gap-2 sm:grid-cols-3"}
              >
                {modelsByProvider[provider as ModelProvider].map(model => {
                  const modelLink = `/chat?prompt_id=${prompt.id}&model=${model.modelId}`
                  return (
                    <div
                      className={
                        "group relative flex flex-nowrap items-center justify-between space-x-1"
                      }
                      key={model.modelId}
                    >
                      <div
                        className={
                          "flex flex-nowrap items-center space-x-1 overflow-hidden text-ellipsis text-nowrap"
                        }
                      >
                        <ModelIcon
                          width={30}
                          height={30}
                          provider={model.provider}
                          modelId={model.modelId}
                        />
                        <div>
                          <span className={"text-foreground/70"}>
                            {model.provider}
                          </span>{" "}
                          / {model.modelName}
                        </div>
                      </div>
                      <WithTooltip
                        display={"Try this prompt with " + model.modelName}
                        trigger={
                          <Link href={modelLink} target={"_blank"}>
                            <IconExternalLink
                              className={
                                "text-foreground invisible right-0 group-hover:visible"
                              }
                              size={18}
                              stroke={1.5}
                            />
                          </Link>
                        }
                      />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </PageContent>
  )
}
