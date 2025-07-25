"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Eye, EyeOff, Save, Key } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    gemini: "",
    groq: "",
  })
  const [showKeys, setShowKeys] = useState({
    openai: false,
    gemini: false,
    groq: false,
  })
  const [activeTab, setActiveTab] = useState("openai")

  const providers = [
    // { id: "openai", name: "OpenAI", description: "GPT-4o, GPT-4o-mini models" },
    { id: "gemini", name: "Google Gemini", description: "Gemini 2.5 Flash, Pro models" },
    // { id: "groq", name: "Groq", description: "Llama 2 70B and other Groq models" },
  ]

  const handleSave = (provider: string) => {
    localStorage.setItem(`api_key_${provider}`, apiKeys[provider as keyof typeof apiKeys])
    alert(`${provider} API key saved successfully!`)
  }

  const toggleShowKey = (provider: string) => {
    setShowKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider as keyof typeof prev],
    }))
  }

  useEffect(() => {
    providers.forEach((provider) => {
      const storedKey = localStorage.getItem(`api_key_${provider.id}`)
      if (storedKey) {
        setApiKeys((prev) => ({
          ...prev,
          [provider.id]: storedKey,
        }))
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#121212] text-[#e0e0e0]">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-lg border border-[#333] transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-[#4CAF50]">Settings</h1>
        </div>

        {/* Settings Content */}
        <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#333]">
          <div className="text-center mb-8">
            <Key className="w-12 h-12 mx-auto mb-4 text-[#4CAF50]" />
            <h2 className="text-2xl font-bold text-[#e0e0e0] mb-2">API Key Management</h2>
            <p className="text-[#888]">
              Your API keys are stored locally in your browser. They never leave your device.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-[#2a2a2a] rounded-lg p-1 mb-6">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setActiveTab(provider.id)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === provider.id
                    ? "bg-[#4CAF50] text-black"
                    : "text-[#e0e0e0] hover:text-white hover:bg-[#333]"
                }`}
              >
                {provider.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {providers.map((provider) => (
            <div key={provider.id} className={`${activeTab === provider.id ? "block" : "hidden"}`}>
              <div className="bg-[#2a2a2a] rounded-lg p-6 border border-[#333]">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#e0e0e0]">{provider.name}</h3>
                    <p className="text-sm text-[#888]">{provider.description}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#e0e0e0]">API Key</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showKeys[provider.id as keyof typeof showKeys] ? "text" : "password"}
                          placeholder={`Enter your ${provider.name} API key...`}
                          value={apiKeys[provider.id as keyof typeof apiKeys]}
                          onChange={(e) =>
                            setApiKeys((prev) => ({
                              ...prev,
                              [provider.id]: e.target.value,
                            }))
                          }
                          className="w-full p-3 pr-10 bg-[#1e1e1e] border border-[#333] rounded-lg text-[#e0e0e0] placeholder-[#666] focus:border-[#4CAF50] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShowKey(provider.id)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#888] hover:text-[#e0e0e0]"
                        >
                          {showKeys[provider.id as keyof typeof showKeys] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => handleSave(provider.id)}
                        disabled={!apiKeys[provider.id as keyof typeof apiKeys]}
                        className="flex items-center gap-2 px-4 py-3 bg-[#4CAF50] hover:bg-[#45a049] disabled:bg-[#666] disabled:cursor-not-allowed rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Save
                      </button>
                    </div>
                  </div>

                  {apiKeys[provider.id as keyof typeof apiKeys] && (
                    <div className="p-3 bg-[#1e1e1e] rounded border border-[#333]">
                      <div className="flex items-center gap-2 text-sm text-[#4CAF50]">
                        <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
                        API key saved locally
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-[#666] space-y-1">
                    <p>• Keys are stored locally in your browser</p>
                    <p>• Keys never leave your device</p>
                    <p>• Clear browser data to remove stored keys</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
