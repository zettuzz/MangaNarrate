import type { GenerateOptions } from "./index"
import { useStore } from "@/store/useStore"

export const geminiAdapter = {
  async generate(options: GenerateOptions): Promise<string> {
    const { model, prompt, negativePrompt, characterList, image } = options
    const apiKey = useStore.getState().apiKeys.gemini

    if (!apiKey) {
      throw new Error("Gemini API key not configured")
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

    const systemPrompt = `You are an expert at creating detailed recap scripts for manga/manhwa.
    ${characterList ? `Characters: ${characterList}` : ""}
    ${negativePrompt ? `Avoid: ${negativePrompt}` : ""}`

    const userPrompt = prompt || "Analyze this image and create a detailed recap script describing what happens."

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\n${userPrompt}` },
                {
                  inline_data: {
                    mime_type: image.type,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.candidates[0]?.content?.parts[0]?.text || "No response generated"
  },
}
