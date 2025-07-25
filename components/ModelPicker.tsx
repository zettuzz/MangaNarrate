"use client"

import { useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useStore } from "@/store/useStore"
import { RefreshCw } from "lucide-react"

export function ModelPicker() {
  const { models, selectedModel, setSelectedModel, loadModels, refreshModels, isLoadingModels } = useStore()

  useEffect(() => {
    loadModels()
  }, [loadModels])

  const handleRefresh = () => {
    refreshModels()
  }

  const groupedModels = models.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = []
      }
      acc[model.provider].push(model)
      return acc
    },
    {} as Record<string, typeof models>,
  )

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Select
          value={selectedModel?.id || ""}
          onValueChange={(value) => {
            const model = models.find((m) => m.id === value)
            setSelectedModel(model || null)
          }}
        >
          <SelectTrigger className="flex-1 bg-[#2a2a2a] border-[#333]">
            <SelectValue placeholder="Select AI model..." />
          </SelectTrigger>
          <SelectContent className="bg-[#2a2a2a] border-[#333]">
            {Object.entries(groupedModels).map(([provider, providerModels]) => (
              <div key={provider}>
                <div className="px-2 py-1 text-xs font-semibold text-[#4CAF50] uppercase">{provider}</div>
                {providerModels.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="hover:bg-[#333]">
                    <div className="flex flex-col">
                      <span>{model.name}</span>
                      {model.description && <span className="text-xs text-[#888]">{model.description}</span>}
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoadingModels}
          className="px-3 bg-transparent"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingModels ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {selectedModel && (
        <div className="text-sm text-[#888] p-2 bg-[#2a2a2a] rounded border border-[#333]">
          <div className="font-medium text-[#e0e0e0]">{selectedModel.name}</div>
          {selectedModel.description && <div className="mt-1">{selectedModel.description}</div>}
          <div className="mt-1 text-xs">
            Provider: <span className="text-[#4CAF50]">{selectedModel.provider}</span>
          </div>
        </div>
      )}
    </div>
  )
}
