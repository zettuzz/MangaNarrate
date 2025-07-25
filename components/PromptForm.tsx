"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useStore, DEFAULT_MANGA_PROMPT } from "@/store/useStore"
import { RotateCcw } from "lucide-react"

export function PromptForm() {
  const { prompt, negativePrompt, characterList, setPrompt, setNegativePrompt, setCharacterList, resetToDefaultPrompt } = useStore()

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaultPrompt}
            className="h-7 px-2 text-xs bg-[#2a2a2a] border-[#333] hover:bg-[#333] hover:border-[#4CAF50]"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset to Default
          </Button>
        </div>
        <Textarea
          id="prompt"
          placeholder="Describe what you want the AI to focus on when analyzing the images..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="bg-[#2a2a2a] border-[#333] text-[#e0e0e0] placeholder:text-[#666] min-h-[120px]"
        />
        <p className="text-xs text-[#666] mt-1">
          💡 This is the default manga analysis prompt. You can modify it or reset to default anytime.
        </p>
      </div>

      <div>
        <Label htmlFor="negative-prompt" className="text-[#e0e0e0] mb-2 block">
          Negative Prompt (Optional)
        </Label>
        <Textarea
          id="negative-prompt"
          placeholder="What should the AI avoid or not focus on..."
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          className="bg-[#2a2a2a] border-[#333] text-[#e0e0e0] placeholder:text-[#666] min-h-[60px]"
        />
      </div>

      <div>
        <Label htmlFor="characters" className="text-[#e0e0e0] mb-2 block">
          Character List (Optional)
        </Label>
        <Textarea
          id="characters"
          placeholder="List main characters and their descriptions..."
          value={characterList}
          onChange={(e) => setCharacterList(e.target.value)}
          className="bg-[#2a2a2a] border-[#333] text-[#e0e0e0] placeholder:text-[#666] min-h-[60px]"
        />
      </div>
    </div>
  )
}
