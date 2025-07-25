import { openaiAdapter } from "./openai"
import { geminiAdapter } from "./gemini"
import { grokAdapter } from "./grok"
import { groqAdapter } from "./groq"
import type { Model } from "@/store/useStore"

export interface GenerateOptions {
  model: Model
  prompt: string
  negativePrompt?: string
  characterList?: string
  image: File
}

export async function generateScript(options: GenerateOptions): Promise<string> {
  const { model } = options

  switch (model.provider) {
    case "openai":
      return await openaiAdapter.generate(options)
    case "gemini":
      return await geminiAdapter.generate(options)
    case "grok":
      return await grokAdapter.generate(options)
    case "groq":
      return await groqAdapter.generate(options)
    default:
      throw new Error(`Unsupported provider: ${model.provider}`)
  }
}
