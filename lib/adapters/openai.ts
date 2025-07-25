import type { GenerateOptions } from "./index"
import { useStore } from "@/store/useStore"

export const openaiAdapter = {
  async generate(options: GenerateOptions): Promise<string> {
    const { model, prompt, negativePrompt, characterList, image } = options
    const apiKey = useStore.getState().apiKeys.openai

    if (!apiKey) {
      throw new Error("OpenAI API key not configured")
    }

    // Convert image to base64
    const base64Image = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(",")[1]) // Remove data:image/... prefix
      }
      reader.readAsDataURL(image)
    })

    const messages = [
      {
        role: "system",
        content: `You are an expert at creating detailed recap scripts for manga/manhwa. 
        ${characterList ? `Characters: ${characterList}` : ""}
        ${negativePrompt ? `Avoid: ${negativePrompt}` : ""}`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt || "Analyze this image and create a detailed recap script describing what happens.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ]

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model.id,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || "No response generated"
  },
}
