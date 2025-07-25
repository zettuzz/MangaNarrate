"use client"

import type React from "react"
import Head from "next/head"
import { useState, useEffect } from "react"
import { Upload, Play, Square, Settings, Download, X, GripVertical, RotateCcw, HelpCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { generateScript as callGenerateScript } from "@/lib/adapters"
import { useStore } from "@/store/useStore"
import { generateScriptPDF, generateScriptPDFWithImages } from "@/lib/pdf-generator"

interface ImageData {
  file: File
  preview: string
  id: string
}

interface Model {
  id: string
  name: string
  provider: string
  description?: string
}

const models: Model[] = [
  { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash", provider: "gemini", description: "Latest Gemini model" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", provider: "gemini", description: "Fast, efficient, and latest Gemini model" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "gemini", description: "High-quality, large context window, latest Gemini model" },
]

const DEFAULT_MANGA_PROMPT = `You are a master manga narrator. Given sequential manga or manhwa pages, write a 3rd-person narrative that captures the full story in a natural prose style — like a light novel or dramatic short story.
Do not describe visual elements like panels, angles, or framing. Avoid cinematic or viewer-based terms (e.g., “camera zooms,” “scene shifts,” “we see,” “in this panel”). Instead, describe the events as if you were telling a story to someone blindfolded.
Fully narrate all actions, reactions, inner thoughts, and emotions of characters. Include non-verbal cues like tension, hesitation, or atmosphere — not just spoken lines.
Dialogue should be embedded naturally into narration, not in quotes — paraphrased where appropriate.
Keep the narrative fluid, immersive, and sequential. Do not skip any part, even if it's minor. Use expressive language and full descriptions to maintain engagement.
✴️ Important: Treat each page like a continuous moment in the unfolding story. It’s okay if the summary becomes long — quality and immersion are the goals.
Use the maximum token allowance and make it detailed, because this will be used for YouTube narration.`

export default function HomePage() {
  const [images, setImages] = useState<ImageData[]>([])
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [prompt, setPrompt] = useState(DEFAULT_MANGA_PROMPT)
  const [negativePrompt, setNegativePrompt] = useState("")
  const [characterList, setCharacterList] = useState("")
  const [script, setScript] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [showFAQ, setShowFAQ] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const { loadModels } = useStore()

  const resetToDefaultPrompt = () => {
    setPrompt(DEFAULT_MANGA_PROMPT)
  }


  // Load models and API keys on component mount
  useEffect(() => {
    loadModels()
  }, [loadModels])

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    const validFiles = Array.from(files).filter((file) => {
      const isValidType = file.type.startsWith("image/")
      const isValidSize = file.size <= 4 * 1024 * 1024 // 4MB
      return isValidType && isValidSize
    })

    const imagePromises = validFiles.map((file) => {
      return new Promise<ImageData>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            file,
            preview: reader.result as string,
            id: Math.random().toString(36).substr(2, 9),
          })
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(imagePromises).then((newImages) => {
      setImages((prev) => [...prev, ...newImages])
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return

    setImages((prev) => {
      const newImages = [...prev]
      const [movedImage] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, movedImage)
      return newImages
    })
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null) {
      moveImage(draggedIndex, dropIndex)
      setDraggedIndex(null)
    }
  }

  const generateScript = async () => {
    if (!selectedModel || images.length === 0) return

    setIsGenerating(true)
    setProgress(0)
    setScript("")
    setCurrentImageIndex(0)

    try {
      for (let i = 0; i < images.length; i++) {
        setCurrentImageIndex(i)
        setProgress((i / images.length) * 100)

        try {
          // Call actual API integration
          const response = await callGenerateScript({
            model: selectedModel,
            prompt,
            negativePrompt: negativePrompt || undefined,
            characterList: characterList || undefined,
            image: images[i].file,
          })

          setScript((prev) => prev + `**Panel ${i + 1}:**\n${response}\n\n`)
        } catch (apiError) {
          console.error(`API call failed for image ${i + 1}:`, apiError)
          const errorMessage = apiError instanceof Error ? apiError.message : 'Unknown error occurred'
          setScript((prev) => prev + `**Panel ${i + 1}:**\n❌ Error: ${errorMessage}\n\n`)
        }
      }
      setProgress(100)
    } catch (error) {
      console.error("Generation failed:", error)
      setScript((prev) => prev + `\n❌ Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPDF = () => {
    if (!script) return
    
    generateScriptPDF(script, {
      title: 'Manga Script',
      author: 'MangaNarrate',
      subject: 'Generated Manga Script Analysis',
      keywords: 'manga, script, recap, analysis'
    })
  }

  const downloadPDFWithImages = () => {
    if (!script || images.length === 0) return
    
    generateScriptPDFWithImages(script, images, {
      title: 'Manga Script with Images',
      author: 'MangaNarrate',
      subject: 'Generated Manga Script with Panel Images',
      keywords: 'manga, script, recap, analysis, images'
    })
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#e0e0e0] flex flex-col">
      <div className="max-w-4xl mx-auto p-6 flex-1 w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl font-bold text-[#4CAF50]">
            <h1>MangaNarrate</h1>
            <p className="text-sm text-[#888]">Open Beta</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFAQ(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-lg border border-[#333] transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              FAQ
            </button>
            <Link href="/settings">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] rounded-lg border border-[#333] transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Controls */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* Upload Section */}
            <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#333]">
              <h2 className="text-lg font-semibold mb-4 text-[#4CAF50]">Upload Images</h2>

              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-[#333] hover:border-[#4CAF50] rounded-lg p-8 text-center cursor-pointer transition-colors"
                onClick={() => document.getElementById("file-input")?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  handleFileUpload(e.dataTransfer.files)
                }}
              >
                <input
                  id="file-input"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-[#666]" />
                <p className="text-[#e0e0e0] mb-2">Drag & drop images here, or click to select</p>
                <p className="text-sm text-[#888]">Max 4MB per image, up to 100 images</p>
              </div>

              {/* Batch Counter */}
              {images.length > 0 && (
                <div className="mt-4 flex justify-between items-center p-3 bg-[#2a2a2a] rounded border border-[#333]">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[#4CAF50]">Manga Panels per Batch:</span>
                    <div className="bg-[#1e1e1e] border border-[#333] rounded px-3 py-1 min-w-[60px] text-center">
                      <span className="text-[#e0e0e0] font-mono">{images.length}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setImages([])}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Image Grid */}
              {images.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-[#1e1e1e] rounded border border-[#333]">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        className="relative group aspect-square cursor-move hover:scale-105 transition-transform"
                      >
                        <Image
                          src={image.preview || "/placeholder.svg"}
                          alt={`Panel ${index + 1}`}
                          fill
                          className="object-cover rounded border-2 border-[#333] group-hover:border-[#4CAF50] transition-colors"
                        />

                        {/* Remove Button */}
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-600 hover:bg-red-700 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>

                        {/* Priority Number */}
                        <div className="absolute bottom-1 left-1 bg-[#4CAF50] text-black text-xs font-bold px-2 py-1 rounded">
                          #{index + 1}
                        </div>

                        {/* Drag Handle */}
                        <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4 text-white bg-black/50 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#666] text-center">
                    💡 Drag and drop images to reorder them. Generation follows the order shown above.
                  </p>
                </div>
              )}
            </div>

            {/* Batch Ready Card */}
            {images.length > 0 && (
              <div className="bg-[#1e1e1e] rounded-lg p-4 border border-[#333]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-[#4CAF50] mb-1">Batch Ready</h3>
                    <p className="text-xs text-[#888]">
                      {images.length} panel{images.length !== 1 ? "s" : ""} queued for processing
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#4CAF50]">{images.length}</div>
                    <div className="text-xs text-[#666]">panels</div>
                  </div>
                </div>
              </div>
            )}

            {/* Model Selection */}
            <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#333]">
              <h2 className="text-lg font-semibold mb-4 text-[#4CAF50]">AI Model</h2>
              <select
                value={selectedModel?.id || ""}
                onChange={(e) => {
                  const model = models.find((m) => m.id === e.target.value)
                  setSelectedModel(model || null)
                }}
                className="w-full p-3 bg-[#2a2a2a] border border-[#333] rounded-lg text-[#e0e0e0] focus:border-[#4CAF50] focus:outline-none"
              >
                <option value="">Select AI model...</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>

              {selectedModel && (
                <div className="mt-3 text-sm text-[#888] p-2 bg-[#2a2a2a] rounded border border-[#333]">
                  <div className="font-medium text-[#e0e0e0]">{selectedModel.name}</div>
                  <div className="mt-1">{selectedModel.description}</div>
                  <div className="mt-1 text-xs">
                    Provider: <span className="text-[#4CAF50]">{selectedModel.provider}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Prompts */}
            <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#333]">
              <h2 className="text-lg font-semibold mb-4 text-[#4CAF50]">Prompts</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-[#e0e0e0]">
                      Main Prompt
                    </label>
                    <button
                      onClick={resetToDefaultPrompt}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-[#2a2a2a] hover:bg-[#333] border border-[#333] hover:border-[#4CAF50] rounded transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset to Default
                    </button>
                  </div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want the AI to focus on..."
                    className="w-full p-3 bg-[#2a2a2a] border border-[#333] rounded-lg text-[#e0e0e0] placeholder-[#666] focus:border-[#4CAF50] focus:outline-none min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-[#666] mt-1">
                    💡 This is the default manga analysis prompt. You can modify it or reset to default anytime.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e0e0e0] mb-2">Negative Prompt (Optional)</label>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="What should the AI avoid..."
                    className="w-full p-3 bg-[#2a2a2a] border border-[#333] rounded-lg text-[#e0e0e0] placeholder-[#666] focus:border-[#4CAF50] focus:outline-none min-h-[60px] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e0e0e0] mb-2">Character List (Optional)</label>
                  <textarea
                    value={characterList}
                    onChange={(e) => setCharacterList(e.target.value)}
                    placeholder="List main characters and descriptions..."
                    className="w-full p-3 bg-[#2a2a2a] border border-[#333] rounded-lg text-[#e0e0e0] placeholder-[#666] focus:border-[#4CAF50] focus:outline-none min-h-[60px] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#333]">
              {isGenerating ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        Processing image {currentImageIndex + 1} of {images.length}
                      </span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-[#2a2a2a] rounded-full h-2">
                      <div
                        className="bg-[#4CAF50] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setIsGenerating(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    Stop Generation
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateScript}
                  disabled={!selectedModel || images.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4CAF50] hover:bg-[#45a049] disabled:bg-[#666] disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Generate Script ({images.length} panel{images.length !== 1 ? "s" : ""})
                </button>
              )}
            </div>
          </div>

          {/* Right Panel - Script Output */}
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-[#1e1e1e] rounded-lg p-6 border border-[#333] h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#4CAF50]">Generated Script</h2>
                {script && (
                  <div className="flex gap-2">
                    <button
                      onClick={downloadPDF}
                      className="flex items-center gap-2 px-3 py-1 bg-[#2a2a2a] hover:bg-[#333] rounded border border-[#333] transition-colors"
                      title="Download script as PDF"
                    >
                      <Download className="w-4 h-4" />
                      PDF
                    </button>
                    {images.length > 0 && (
                      <button
                        onClick={downloadPDFWithImages}
                        className="flex items-center gap-2 px-3 py-1 bg-[#4CAF50] hover:bg-[#45a049] rounded border border-[#4CAF50] transition-colors"
                        title="Download script with images as PDF"
                      >
                        <Download className="w-4 h-4" />
                        PDF + Images
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="h-96 overflow-y-auto bg-[#2a2a2a] rounded border border-[#333] p-4">
                {script ? (
                  <div className="whitespace-pre-wrap text-[#e0e0e0] leading-relaxed">{script}</div>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#666]">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📝</div>
                      <p>Your generated script will appear here</p>
                      <p className="text-sm mt-2">Upload images and click "Generate Script" to start</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Modal */}
      {showFAQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#1e1e1e] rounded-lg border border-[#333] max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowFAQ(false)}
              className="absolute top-3 right-3 text-[#888] hover:text-[#e0e0e0]"
              aria-label="Close FAQ"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-[#4CAF50] mb-4">FAQ</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#e0e0e0]">What does this website do?</h3>
                <p className="text-[#bbb] mt-1">
                  This website allows you to upload manga or manhwa images and uses advanced AI models (Google Gemini) to generate detailed narrative scripts describing the story in natural, engaging prose. It is designed for manga fans, content creators, and anyone who wants to turn visual stories into written recaps or summaries.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#e0e0e0]">Is it safe to use?</h3>
                <p className="text-[#bbb] mt-1">
                  Yes! Your images and API keys are processed locally in your browser and are never sent to any server except the official AI provider (Google Gemini) for script generation. API keys are encrypted and stored only on your device. We do not collect, store, or share your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Use Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#1e1e1e] rounded-lg border border-[#333] max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowTerms(false)}
              className="absolute top-3 right-3 text-[#888] hover:text-[#e0e0e0]"
              aria-label="Close Terms of Use"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-[#4CAF50] mb-4">Terms of Use</h2>
            <div className="space-y-4 text-[#bbb]">
              <p>
                By using this website, you agree to use it for lawful purposes only. You must not upload any content that infringes on the rights of others or violates any laws. The AI-generated scripts are for personal and non-commercial use unless otherwise permitted. We reserve the right to update these terms at any time.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Do not upload illegal, explicit, or copyrighted material without permission.</li>
                <li>Generated content is provided as-is and may not always be accurate or appropriate.</li>
                <li>We are not responsible for any misuse of the generated scripts.</li>
                <li>Continued use of the site constitutes acceptance of these terms.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[#1e1e1e] rounded-lg border border-[#333] max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowPrivacy(false)}
              className="absolute top-3 right-3 text-[#888] hover:text-[#e0e0e0]"
              aria-label="Close Privacy Policy"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-[#4CAF50] mb-4">Privacy Policy</h2>
            <div className="space-y-4 text-[#bbb]">
              <p>
                Your privacy is important to us. This website processes your images and API keys locally in your browser. We do not collect, store, or share your data. API keys are encrypted and stored only on your device for your convenience.
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Images are only sent to the official AI provider (Google Gemini) for script generation.</li>
                <li>API keys are never transmitted to our servers or any third party.</li>
                <li>You can clear your API keys at any time from the settings page.</li>
                <li>We do not use cookies or tracking scripts.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-[#181818] border-t border-[#333] py-4 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-2 text-sm text-[#888]">
          <div className="flex gap-4 mb-2 md:mb-0">
            <button
              onClick={() => setShowTerms(true)}
              className="hover:text-[#4CAF50] transition-colors underline underline-offset-2"
            >
              Terms of Use
            </button>
            <button
              onClick={() => setShowPrivacy(true)}
              className="hover:text-[#4CAF50] transition-colors underline underline-offset-2"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setShowFAQ(true)}
              className="hover:text-[#4CAF50] transition-colors underline underline-offset-2"
            >
              FAQ
            </button>
          </div>
          <div>
            &copy; {new Date().getFullYear()} MangaNarrate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
