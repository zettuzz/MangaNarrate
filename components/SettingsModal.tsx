"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/store/useStore"
import { Eye, EyeOff, Save, Key } from "lucide-react"

export function SettingsModal() {
  const { apiKeys, setApiKey } = useStore()
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({
    openai: apiKeys.openai || "",
    gemini: apiKeys.gemini || "",
    groq: apiKeys.groq || "",
  })

  const toggleShowKey = (provider: string) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }))
  }

  const handleSave = (provider: string) => {
    setApiKey(provider, tempKeys[provider])
  }

  const providers = [
    // { id: "openai", name: "OpenAI", description: "GPT-4o, GPT-4o-mini models" },
    { id: "gemini", name: "Google Gemini", description: "Gemini 2.5 Flash, Pro models" },
    { id: "groq", name: "Groq", description: "Llama 2 70B and other Groq models" },
  ]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="w-12 h-12 mx-auto mb-4 text-[#4CAF50]" />
        <h2 className="text-2xl font-bold text-[#e0e0e0] mb-2">API Key Management</h2>
        <p className="text-[#888]">
          Your API keys are encrypted and stored locally in your browser. They never leave your device.
        </p>
      </div>

      <Tabs defaultValue="openai" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#2a2a2a]">
          {providers.map((provider) => (
            <TabsTrigger
              key={provider.id}
              value={provider.id}
              className="data-[state=active]:bg-[#4CAF50] data-[state=active]:text-black"
            >
              {provider.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {providers.map((provider) => (
          <TabsContent key={provider.id} value={provider.id}>
            <Card className="p-6 bg-[#2a2a2a] border-[#333]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#e0e0e0]">{provider.name}</h3>
                  <p className="text-sm text-[#888]">{provider.description}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`${provider.id}-key`} className="text-[#e0e0e0]">
                    API Key
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={`${provider.id}-key`}
                        type={showKeys[provider.id] ? "text" : "password"}
                        placeholder={`Enter your ${provider.name} API key...`}
                        value={tempKeys[provider.id]}
                        onChange={(e) =>
                          setTempKeys((prev) => ({
                            ...prev,
                            [provider.id]: e.target.value,
                          }))
                        }
                        className="bg-[#1e1e1e] border-[#333] text-[#e0e0e0] pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleShowKey(provider.id)}
                      >
                        {showKeys[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleSave(provider.id)}
                      disabled={!tempKeys[provider.id]}
                      className="bg-[#4CAF50] hover:bg-[#45a049]"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                {apiKeys[provider.id] && (
                  <div className="p-3 bg-[#1e1e1e] rounded border border-[#333]">
                    <div className="flex items-center gap-2 text-sm text-[#4CAF50]">
                      <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
                      API key saved and encrypted
                    </div>
                  </div>
                )}

                <div className="text-xs text-[#666] space-y-1">
                  <p>• Keys are encrypted using AES-GCM before storage</p>
                  <p>• Keys are automatically cleared after 10 minutes of inactivity</p>
                  <p>• Keys never leave your browser or device</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
