import { ChatbotUIContext } from "@/context/context"
import { PROFILE_CONTEXT_MAX, PROFILE_DISPLAY_NAME_MAX } from "@/db/limits"
import { updateProfile } from "@/db/profile"
import { uploadProfileImage } from "@/db/storage/profile-images"
import { exportLocalStorageAsJSON } from "@/lib/export-old-data"
import { fetchOpenRouterModels } from "@/lib/models/fetch-models"
import { LLM_LIST_MAP } from "@/lib/models/llm/llm-list"
import { supabase } from "@/lib/supabase/browser-client"
import { cn } from "@/lib/utils"
import { OpenRouterLLM } from "@/types"
import {
  IconFileDownload,
  IconLoader2,
  IconLogout,
  IconSettings,
  IconUser
} from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { FC, useContext, useRef, useState } from "react"
import { toast } from "sonner"
import { SIDEBAR_ICON_SIZE } from "../sidebar2/sidebar-top-level-links"
import { Button } from "../ui/button"
import ImagePicker from "../ui/image-picker"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { LimitDisplay } from "../ui/limit-display"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { TextareaAutosize } from "../ui/textarea-autosize"
import { WithTooltip } from "../ui/with-tooltip"
import { ThemeSwitcher } from "./theme-switcher"
import { redirectToBillingPortal } from "@/actions/stripe"
import { PLAN_FREE } from "@/lib/stripe/config"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileSettingsProps {}

export const ProfileSettings: FC<ProfileSettingsProps> = ({}) => {
  const {
    profile,
    setProfile,
    envKeyMap,
    setAvailableHostedModels,
    setAvailableOpenRouterModels,
    availableOpenRouterModels,
    setIsPaywallOpen
  } = useContext(ChatbotUIContext)

  const router = useRouter()

  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)

  const [displayName, setDisplayName] = useState(profile?.display_name || "")
  const [username, setUsername] = useState(profile?.username || "")
  const [usernameAvailable, setUsernameAvailable] = useState(true)
  // const [loadingUsername, setLoadingUsername] = useState(false)
  const [profileImageSrc, setProfileImageSrc] = useState(
    profile?.image_url || ""
  )
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileInstructions, setProfileInstructions] = useState(
    profile?.profile_context || ""
  )

  const [useAzureOpenai, setUseAzureOpenai] = useState(
    profile?.use_azure_openai
  )
  const [openaiAPIKey, setOpenaiAPIKey] = useState(
    profile?.openai_api_key || ""
  )
  const [openaiOrgID, setOpenaiOrgID] = useState(
    profile?.openai_organization_id || ""
  )
  const [azureOpenaiAPIKey, setAzureOpenaiAPIKey] = useState(
    profile?.azure_openai_api_key || ""
  )
  const [azureOpenaiEndpoint, setAzureOpenaiEndpoint] = useState(
    profile?.azure_openai_endpoint || ""
  )
  const [azureOpenai35TurboID, setAzureOpenai35TurboID] = useState(
    profile?.azure_openai_35_turbo_id || ""
  )
  const [azureOpenai45TurboID, setAzureOpenai45TurboID] = useState(
    profile?.azure_openai_45_turbo_id || ""
  )
  const [azureOpenai45VisionID, setAzureOpenai45VisionID] = useState(
    profile?.azure_openai_45_vision_id || ""
  )
  const [azureEmbeddingsID, setAzureEmbeddingsID] = useState(
    profile?.azure_openai_embeddings_id || ""
  )
  const [anthropicAPIKey, setAnthropicAPIKey] = useState(
    profile?.anthropic_api_key || ""
  )
  const [googleGeminiAPIKey, setGoogleGeminiAPIKey] = useState(
    profile?.google_gemini_api_key || ""
  )
  const [mistralAPIKey, setMistralAPIKey] = useState(
    profile?.mistral_api_key || ""
  )
  const [groqAPIKey, setGroqAPIKey] = useState(profile?.groq_api_key || "")
  const [perplexityAPIKey, setPerplexityAPIKey] = useState(
    profile?.perplexity_api_key || ""
  )

  const [openrouterAPIKey, setOpenrouterAPIKey] = useState(
    profile?.openrouter_api_key || ""
  )

  const [toolsCommand, setToolsCommand] = useState(
    profile?.tools_command || "!"
  )

  const [assistantCommand, setAssistantCommand] = useState(
    profile?.assistant_command || "@"
  )

  const [filesCommand, setFilesCommand] = useState(
    profile?.files_command || "#"
  )

  const [promptCommand, setPromptCommand] = useState(
    profile?.prompt_command || "/"
  )

  const [sendMessageOnEnter, setSendMessageOnEnter] = useState<boolean>(
    profile?.send_message_on_enter || true
  )

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
    return
  }

  const handleSave = async () => {
    if (!profile) return
    let profileImageUrl = profile.image_url
    let profileImagePath = ""

    if (profileImageFile) {
      const { path, url } = await uploadProfileImage(profile, profileImageFile)
      profileImageUrl = url ?? profileImageUrl
      profileImagePath = path
    }

    const updatedProfile = await updateProfile(profile.id, {
      ...profile,
      display_name: displayName,
      username,
      profile_context: profileInstructions,
      image_url: profileImageUrl,
      image_path: profileImagePath,
      openai_api_key: openaiAPIKey,
      openai_organization_id: openaiOrgID,
      anthropic_api_key: anthropicAPIKey,
      google_gemini_api_key: googleGeminiAPIKey,
      mistral_api_key: mistralAPIKey,
      groq_api_key: groqAPIKey,
      perplexity_api_key: perplexityAPIKey,
      use_azure_openai: useAzureOpenai,
      azure_openai_api_key: azureOpenaiAPIKey,
      azure_openai_endpoint: azureOpenaiEndpoint,
      azure_openai_35_turbo_id: azureOpenai35TurboID,
      azure_openai_45_turbo_id: azureOpenai45TurboID,
      azure_openai_45_vision_id: azureOpenai45VisionID,
      azure_openai_embeddings_id: azureEmbeddingsID,
      openrouter_api_key: openrouterAPIKey,
      send_message_on_enter: sendMessageOnEnter,
      tools_command: toolsCommand,
      assistant_command: assistantCommand,
      files_command: filesCommand,
      prompt_command: promptCommand
    })

    setProfile(updatedProfile)

    toast.success("Profile updated!")

    const providers = [
      "openai",
      "google",
      "azure",
      "anthropic",
      "mistral",
      "groq",
      "perplexity",
      "openrouter"
    ]

    providers.forEach(async provider => {
      let providerKey: keyof typeof profile

      if (provider === "google") {
        providerKey = "google_gemini_api_key"
      } else if (provider === "azure") {
        providerKey = "azure_openai_api_key"
      } else {
        providerKey = `${provider}_api_key` as keyof typeof profile
      }

      const models = LLM_LIST_MAP[provider]
      const envKeyActive = envKeyMap[provider]

      if (!envKeyActive) {
        const hasApiKey = !!updatedProfile[providerKey]

        if (provider === "openrouter") {
          if (hasApiKey && availableOpenRouterModels.length === 0) {
            const openrouterModels: OpenRouterLLM[] =
              await fetchOpenRouterModels()
            setAvailableOpenRouterModels(prev => {
              const newModels = openrouterModels.filter(
                model =>
                  !prev.some(prevModel => prevModel.modelId === model.modelId)
              )
              return [...prev, ...newModels]
            })
          } else {
            setAvailableOpenRouterModels([])
          }
        } else {
          if (hasApiKey && Array.isArray(models)) {
            setAvailableHostedModels(prev => {
              const newModels = models.filter(
                model =>
                  !prev.some(prevModel => prevModel.modelId === model.modelId)
              )
              return [...prev, ...newModels]
            })
          } else if (!hasApiKey && Array.isArray(models)) {
            setAvailableHostedModels(prev =>
              prev.filter(model => !models.includes(model))
            )
          }
        }
      }
    })

    setIsOpen(false)
  }

  const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout | null

    return (...args: any[]) => {
      const later = () => {
        if (timeout) clearTimeout(timeout)
        func(...args)
      }

      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  // const checkUsernameAvailability = useCallback(
  //   debounce(async (username: string) => {
  //     if (!username) return
  //
  //     if (username.length < PROFILE_USERNAME_MIN) {
  //       setUsernameAvailable(false)
  //       return
  //     }
  //
  //     if (username.length > PROFILE_USERNAME_MAX) {
  //       setUsernameAvailable(false)
  //       return
  //     }
  //
  //     const usernameRegex = /^[a-zA-Z0-9_]+$/
  //     if (!usernameRegex.test(username)) {
  //       setUsernameAvailable(false)
  //       alert(
  //         "Username must be letters, numbers, or underscores only - no other characters or spacing allowed."
  //       )
  //       return
  //     }
  //
  //     setLoadingUsername(true)
  //
  //     const response = await fetch(`/api/username/available`, {
  //       method: "POST",
  //       body: JSON.stringify({ username })
  //     })
  //
  //     const data = await response.json()
  //     const isAvailable = data.isAvailable
  //
  //     setUsernameAvailable(isAvailable)
  //
  //     if (username === profile?.username) {
  //       setUsernameAvailable(true)
  //     }
  //
  //     setLoadingUsername(false)
  //   }, 500),
  //   []
  // )

  function resetToDefaults() {
    setFilesCommand("#")
    setAssistantCommand("@")
    setPromptCommand("/")
    setToolsCommand("!")
    setSendMessageOnEnter(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      buttonRef.current?.click()
    }
  }

  if (!profile) return null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        className={
          "flex w-full items-center justify-between border-t pt-2 text-sm"
        }
      >
        <div
          className={
            "hover:bg-accent/60 flex h-[40px] w-full items-center justify-between space-x-2 rounded-md px-2 text-left"
          }
        >
          <div className={"flex items-center"}>
            <Avatar className={"mr-2 size-7"}>
              <AvatarImage
                src={profile.image_url!}
                height={SIDEBAR_ICON_SIZE}
                width={SIDEBAR_ICON_SIZE}
              />
              <AvatarFallback>
                <IconUser size={SIDEBAR_ICON_SIZE} />
              </AvatarFallback>
            </Avatar>

            {profile.display_name}
          </div>

          <IconSettings
            stroke={1.5}
            size={20}
            className={"text-foreground/50"}
          />
        </div>
      </SheetTrigger>

      <SheetContent
        className="flex flex-col justify-between"
        side="left"
        onKeyDown={handleKeyDown}
      >
        <div className="grow overflow-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between space-x-2">
              <div>User Settings</div>

              <Button
                tabIndex={-1}
                className="text-xs"
                size="sm"
                onClick={handleSignOut}
              >
                <IconLogout className="mr-1" size={20} />
                Logout
              </Button>
            </SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="profile">
            <TabsList className="mt-4 flex w-full space-x-1">
              <TabsTrigger className={"flex-1"} value="profile">
                Profile
              </TabsTrigger>
              <TabsTrigger className={"flex-1"} value="shortcuts">
                Shortcuts
              </TabsTrigger>
              {profile?.plan.startsWith("byok_") && (
                <TabsTrigger className={"flex-1"} value="keys">
                  API Keys
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent className="mt-4 space-y-4" value="profile">
              <form>
                {/*<div className="space-y-1">*/}
                {/*  <div className="flex items-center space-x-2">*/}
                {/*    <Label>Username</Label>*/}

                {/*    <div className="text-xs">*/}
                {/*      {username !== profile.username ? (*/}
                {/*        usernameAvailable ? (*/}
                {/*          <div className="text-green-500">AVAILABLE</div>*/}
                {/*        ) : (*/}
                {/*          <div className="text-red-500">UNAVAILABLE</div>*/}
                {/*        )*/}
                {/*      ) : null}*/}
                {/*    </div>*/}
                {/*  </div>*/}

                {/*  <div className="relative">*/}
                {/*    <Input*/}
                {/*      className="pr-10"*/}
                {/*      placeholder="Username..."*/}
                {/*      value={username}*/}
                {/*      onChange={e => {*/}
                {/*        setUsername(e.target.value)*/}
                {/*        checkUsernameAvailability(e.target.value)*/}
                {/*      }}*/}
                {/*      minLength={PROFILE_USERNAME_MIN}*/}
                {/*      maxLength={PROFILE_USERNAME_MAX}*/}
                {/*    />*/}

                {/*    {username !== profile.username ? (*/}
                {/*      <div className="absolute inset-y-0 right-0 flex items-center pr-3">*/}
                {/*        {loadingUsername ? (*/}
                {/*          <IconLoader2 className="animate-spin" />*/}
                {/*        ) : usernameAvailable ? (*/}
                {/*          <IconCircleCheckFilled className="text-green-500" />*/}
                {/*        ) : (*/}
                {/*          <IconCircleXFilled className="text-red-500" />*/}
                {/*        )}*/}
                {/*      </div>*/}
                {/*    ) : null}*/}
                {/*  </div>*/}

                {/*  <LimitDisplay*/}
                {/*    used={username.length}*/}
                {/*    limit={PROFILE_USERNAME_MAX}*/}
                {/*  />*/}
                {/*</div>*/}

                <div className="space-y-1">
                  <Label>Profile Image</Label>

                  <ImagePicker
                    src={profileImageSrc}
                    image={profileImageFile}
                    height={50}
                    width={50}
                    onSrcChange={setProfileImageSrc}
                    onImageChange={setProfileImageFile}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Chat Display Name</Label>

                  <Input
                    placeholder="Chat display name..."
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    maxLength={PROFILE_DISPLAY_NAME_MAX}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-sm">
                    What would you like the AI to know about you to provide
                    better responses?
                  </Label>

                  <TextareaAutosize
                    value={profileInstructions}
                    onValueChange={setProfileInstructions}
                    placeholder="Profile context... (optional)"
                    minRows={6}
                    maxRows={10}
                  />

                  <LimitDisplay
                    used={profileInstructions.length}
                    limit={PROFILE_CONTEXT_MAX}
                  />
                </div>
                <div className={"space-y-1"}>
                  {profile.plan != PLAN_FREE ? (
                    <Button
                      className={"w-full"}
                      formAction={redirectToBillingPortal}
                    >
                      Manage subscription
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-violet-700"
                      onClick={event => {
                        event.stopPropagation()
                        event.preventDefault()
                        setIsPaywallOpen(true)
                      }}
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              </form>
            </TabsContent>

            <TabsContent className="mt-4 space-y-4" value="keys">
              <div className="mt-5 space-y-2">
                <Label className="flex items-center">
                  {useAzureOpenai
                    ? envKeyMap["azure"]
                      ? ""
                      : "Azure OpenAI API Key"
                    : envKeyMap["openai"]
                      ? ""
                      : "OpenAI API Key"}

                  <Button
                    className={cn(
                      "h-[18px] w-[150px] text-[11px]",
                      (useAzureOpenai && !envKeyMap["azure"]) ||
                        (!useAzureOpenai && !envKeyMap["openai"])
                        ? "ml-3"
                        : "mb-3"
                    )}
                    onClick={() => setUseAzureOpenai(!useAzureOpenai)}
                  >
                    {useAzureOpenai
                      ? "Switch To Standard OpenAI"
                      : "Switch To Azure OpenAI"}
                  </Button>
                </Label>

                {useAzureOpenai ? (
                  <>
                    {envKeyMap["azure"] ? (
                      <Label>Azure OpenAI API key set by admin.</Label>
                    ) : (
                      <Input
                        placeholder="Azure OpenAI API Key"
                        type="password"
                        value={azureOpenaiAPIKey}
                        onChange={e => setAzureOpenaiAPIKey(e.target.value)}
                      />
                    )}
                  </>
                ) : (
                  <>
                    {envKeyMap["openai"] ? (
                      <Label>OpenAI API key set by admin.</Label>
                    ) : (
                      <Input
                        placeholder="OpenAI API Key"
                        type="password"
                        value={openaiAPIKey}
                        onChange={e => setOpenaiAPIKey(e.target.value)}
                      />
                    )}
                  </>
                )}
              </div>

              <div className="ml-8 space-y-3">
                {useAzureOpenai ? (
                  <>
                    {
                      <div className="space-y-1">
                        {envKeyMap["azure_openai_endpoint"] ? (
                          <Label className="text-xs">
                            Azure endpoint set by admin.
                          </Label>
                        ) : (
                          <>
                            <Label>Azure Endpoint</Label>

                            <Input
                              placeholder="https://your-endpoint.openai.azure.com"
                              value={azureOpenaiEndpoint}
                              onChange={e =>
                                setAzureOpenaiEndpoint(e.target.value)
                              }
                            />
                          </>
                        )}
                      </div>
                    }

                    {
                      <div className="space-y-1">
                        {envKeyMap["azure_gpt_35_turbo_name"] ? (
                          <Label className="text-xs">
                            Azure GPT-3.5 Turbo deployment name set by admin.
                          </Label>
                        ) : (
                          <>
                            <Label>Azure GPT-3.5 Turbo Deployment Name</Label>

                            <Input
                              placeholder="Azure GPT-3.5 Turbo Deployment Name"
                              value={azureOpenai35TurboID}
                              onChange={e =>
                                setAzureOpenai35TurboID(e.target.value)
                              }
                            />
                          </>
                        )}
                      </div>
                    }

                    {
                      <div className="space-y-1">
                        {envKeyMap["azure_gpt_45_turbo_name"] ? (
                          <Label className="text-xs">
                            Azure GPT-4.5 Turbo deployment name set by admin.
                          </Label>
                        ) : (
                          <>
                            <Label>Azure GPT-4.5 Turbo Deployment Name</Label>

                            <Input
                              placeholder="Azure GPT-4.5 Turbo Deployment Name"
                              value={azureOpenai45TurboID}
                              onChange={e =>
                                setAzureOpenai45TurboID(e.target.value)
                              }
                            />
                          </>
                        )}
                      </div>
                    }

                    {
                      <div className="space-y-1">
                        {envKeyMap["azure_gpt_45_vision_name"] ? (
                          <Label className="text-xs">
                            Azure GPT-4.5 Vision deployment name set by admin.
                          </Label>
                        ) : (
                          <>
                            <Label>Azure GPT-4.5 Vision Deployment Name</Label>

                            <Input
                              placeholder="Azure GPT-4.5 Vision Deployment Name"
                              value={azureOpenai45VisionID}
                              onChange={e =>
                                setAzureOpenai45VisionID(e.target.value)
                              }
                            />
                          </>
                        )}
                      </div>
                    }

                    {
                      <div className="space-y-1">
                        {envKeyMap["azure_embeddings_name"] ? (
                          <Label className="text-xs">
                            Azure Embeddings deployment name set by admin.
                          </Label>
                        ) : (
                          <>
                            <Label>Azure Embeddings Deployment Name</Label>

                            <Input
                              placeholder="Azure Embeddings Deployment Name"
                              value={azureEmbeddingsID}
                              onChange={e =>
                                setAzureEmbeddingsID(e.target.value)
                              }
                            />
                          </>
                        )}
                      </div>
                    }
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      {envKeyMap["openai_organization_id"] ? (
                        <Label className="text-xs">
                          OpenAI Organization ID set by admin.
                        </Label>
                      ) : (
                        <>
                          <Label>OpenAI Organization ID</Label>

                          <Input
                            placeholder="OpenAI Organization ID (optional)"
                            disabled={
                              !!process.env.NEXT_PUBLIC_OPENAI_ORGANIZATION_ID
                            }
                            type="password"
                            value={openaiOrgID}
                            onChange={e => setOpenaiOrgID(e.target.value)}
                          />
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-1">
                {envKeyMap["anthropic"] ? (
                  <Label>Anthropic API key set by admin.</Label>
                ) : (
                  <>
                    <Label>Anthropic API Key</Label>
                    <Input
                      placeholder="Anthropic API Key"
                      type="password"
                      value={anthropicAPIKey}
                      onChange={e => setAnthropicAPIKey(e.target.value)}
                    />
                  </>
                )}
              </div>

              <div className="space-y-1">
                {envKeyMap["google"] ? (
                  <Label>Google Gemini API key set by admin.</Label>
                ) : (
                  <>
                    <Label>Google Gemini API Key</Label>
                    <Input
                      placeholder="Google Gemini API Key"
                      type="password"
                      value={googleGeminiAPIKey}
                      onChange={e => setGoogleGeminiAPIKey(e.target.value)}
                    />
                  </>
                )}
              </div>

              <div className="space-y-1">
                {envKeyMap["mistral"] ? (
                  <Label>Mistral API key set by admin.</Label>
                ) : (
                  <>
                    <Label>Mistral API Key</Label>
                    <Input
                      placeholder="Mistral API Key"
                      type="password"
                      value={mistralAPIKey}
                      onChange={e => setMistralAPIKey(e.target.value)}
                    />
                  </>
                )}
              </div>

              <div className="space-y-1">
                {envKeyMap["groq"] ? (
                  <Label>Groq API key set by admin.</Label>
                ) : (
                  <>
                    <Label>Groq API Key</Label>
                    <Input
                      placeholder="Groq API Key"
                      type="password"
                      value={groqAPIKey}
                      onChange={e => setGroqAPIKey(e.target.value)}
                    />
                  </>
                )}
              </div>

              <div className="space-y-1">
                {envKeyMap["perplexity"] ? (
                  <Label>Perplexity API key set by admin.</Label>
                ) : (
                  <>
                    <Label>Perplexity API Key</Label>
                    <Input
                      placeholder="Perplexity API Key"
                      type="password"
                      value={perplexityAPIKey}
                      onChange={e => setPerplexityAPIKey(e.target.value)}
                    />
                  </>
                )}
              </div>

              <div className="space-y-1">
                {envKeyMap["openrouter"] ? (
                  <Label>OpenRouter API key set by admin.</Label>
                ) : (
                  <>
                    <Label>OpenRouter API Key</Label>
                    <Input
                      placeholder="OpenRouter API Key"
                      type="password"
                      value={openrouterAPIKey}
                      onChange={e => setOpenrouterAPIKey(e.target.value)}
                    />
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent className="mt-4 space-y-4 py-2" value="shortcuts">
              <div className="space-y-5">
                <div className={"flex items-center justify-between"}>
                  <Label>
                    Send message on{" "}
                    {navigator.platform.toUpperCase().indexOf("MAC") > -1
                      ? "⌘"
                      : "Ctrl"}
                    +Enter
                  </Label>
                  <Switch
                    checked={!sendMessageOnEnter}
                    onCheckedChange={() =>
                      setSendMessageOnEnter(!sendMessageOnEnter)
                    }
                  />
                </div>

                <Separator />
                <div>
                  <div className={"grid grid-cols-2 items-center gap-1"}>
                    <Label>Assistant command</Label>
                    <Input
                      minLength={1}
                      maxLength={1}
                      value={assistantCommand}
                      onChange={e => setAssistantCommand(e.target.value)}
                    />
                    <Label>Plugins command</Label>
                    <Input
                      minLength={1}
                      maxLength={1}
                      value={toolsCommand}
                      onChange={e => setToolsCommand(e.target.value)}
                    />
                    <Label>Prompt command</Label>
                    <Input
                      minLength={1}
                      maxLength={1}
                      value={promptCommand}
                      onChange={e => setPromptCommand(e.target.value)}
                    />
                    <Label>Files command</Label>
                    <Input
                      minLength={1}
                      maxLength={1}
                      value={filesCommand}
                      onChange={e => setFilesCommand(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  className="w-full"
                  variant={"secondary"}
                  onClick={resetToDefaults}
                >
                  Reset to defaults
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-6 flex items-center">
          <div className="flex items-center space-x-1">
            <ThemeSwitcher />

            <WithTooltip
              display={
                <div>
                  Download ChatLabs 1.0 data as JSON. Import coming soon!
                </div>
              }
              trigger={
                <IconFileDownload
                  className="cursor-pointer hover:opacity-50"
                  size={32}
                  onClick={exportLocalStorageAsJSON}
                />
              }
            />
          </div>

          <div className="ml-auto space-x-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>

            <Button ref={buttonRef} onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
