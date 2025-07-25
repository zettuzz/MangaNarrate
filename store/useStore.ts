import { create } from "zustand"
import { persist } from "zustand/middleware"

export const DEFAULT_MANGA_PROMPT = `You are a master manga narrator. Given sequential manga or manhwa pages, write a 3rd-person narrative that captures the full story in a natural prose style — like a light novel or dramatic short story.

Do not describe visual elements like panels, angles, or framing. Avoid cinematic or viewer-based terms (e.g., “camera zooms,” “scene shifts,” “we see,” “in this panel”). Instead, describe the events as if you were telling a story to someone blindfolded.

Fully narrate all actions, reactions, inner thoughts, and emotions of characters. Include non-verbal cues like tension, hesitation, or atmosphere — not just spoken lines.

Dialogue should be embedded naturally into narration, not in quotes — paraphrased where appropriate.

Keep the narrative fluid, immersive, and sequential. Do not skip any part, even if it's minor. Use expressive language and full descriptions to maintain engagement.

✴️ Important: Treat each page like a continuous moment in the unfolding story. It’s okay if the summary becomes long — quality and immersion are the goals.

Use the maximum token allowance and make it detailed, because this will be used for YouTube narration.`

export interface ImageData {
  file: File
  preview: string
}

export interface Model {
  id: string
  name: string
  provider: string
  description?: string
}

interface StoreState {
  // Images
  images: ImageData[]
  addImages: (newImages: ImageData[]) => void
  removeImage: (index: number) => void
  reorderImages: (startIndex: number, endIndex: number) => void
  clearImages: () => void

  // Models
  models: Model[]
  selectedModel: Model | null
  isLoadingModels: boolean
  setModels: (models: Model[]) => void
  setSelectedModel: (model: Model | null) => void
  loadModels: () => Promise<void>
  refreshModels: () => Promise<void>

  // Prompts
  prompt: string
  negativePrompt: string
  characterList: string
  setPrompt: (prompt: string) => void
  setNegativePrompt: (prompt: string) => void
  setCharacterList: (list: string) => void
  resetToDefaultPrompt: () => void

  // Generation
  script: string
  isGenerating: boolean
  progress: number
  setScript: (script: string) => void
  addToScript: (text: string) => void
  setIsGenerating: (generating: boolean) => void
  setProgress: (progress: number) => void

  // API Keys
  apiKeys: Record<string, string>
  setApiKey: (provider: string, key: string) => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Images
      images: [],
      addImages: (newImages) =>
        set((state) => ({
          images: [...state.images, ...newImages],
        })),
      removeImage: (index) =>
        set((state) => ({
          images: state.images.filter((_, i) => i !== index),
        })),
      reorderImages: (startIndex, endIndex) =>
        set((state) => {
          if (startIndex === endIndex) return state

          const result = Array.from(state.images)
          const [removed] = result.splice(startIndex, 1)
          result.splice(endIndex, 0, removed)

          return { images: result }
        }),
      clearImages: () => set({ images: [] }),

      // Models
      models: [],
      selectedModel: null,
      isLoadingModels: false,
      setModels: (models) => set({ models }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      loadModels: async () => {
        set({ isLoadingModels: true })
        try {
          // Load from models.json first
          const response = await fetch("/models.json")
          const models = await response.json()
          set({ models })
          
          // Also load API keys from localStorage
          const apiKeys: Record<string, string> = {}
          const providers = ['openai', 'gemini', 'grok']
          providers.forEach(provider => {
            const key = localStorage.getItem(`api_key_${provider}`)
            if (key) {
              apiKeys[provider] = key
            }
          })
          set({ apiKeys })
        } catch (error) {
          console.error("Failed to load models:", error)
        } finally {
          set({ isLoadingModels: false })
        }
      },
      refreshModels: async () => {
        set({ isLoadingModels: true })
        try {
          // TODO: Implement live model fetching from providers
          await get().loadModels()
        } catch (error) {
          console.error("Failed to refresh models:", error)
        } finally {
          set({ isLoadingModels: false })
        }
      },

      // Prompts
      prompt: DEFAULT_MANGA_PROMPT,
      negativePrompt: "",
      characterList: "",
      setPrompt: (prompt) => set({ prompt }),
      setNegativePrompt: (negativePrompt) => set({ negativePrompt }),
      setCharacterList: (characterList) => set({ characterList }),
      resetToDefaultPrompt: () => set({ prompt: DEFAULT_MANGA_PROMPT }),

      // Generation
      script: "",
      isGenerating: false,
      progress: 0,
      setScript: (script) => set({ script }),
      addToScript: (text) =>
        set((state) => ({
          script: state.script + text,
        })),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setProgress: (progress) => set({ progress }),

      // API Keys
      apiKeys: {},
      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),
    }),
    {
      name: "recapscript-storage",
      partialize: (state) => ({
        prompt: state.prompt,
        negativePrompt: state.negativePrompt,
        characterList: state.characterList,
        selectedModel: state.selectedModel,
        apiKeys: state.apiKeys,
      }),
    },
  ),
)
