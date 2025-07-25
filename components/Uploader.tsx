"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useStore } from "@/store/useStore"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

// Utility to compress and resize image
async function compressAndResizeImage(file: File, maxWidth = 800, quality = 0.7): Promise<{ file: File; preview: string }> {
  return new Promise((resolve) => {
    const img = new window.Image()
    const reader = new FileReader()
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        // Prefer JPEG, fallback to WebP
        canvas.toBlob((blob) => {
          if (!blob) return
          const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
          const preview = URL.createObjectURL(blob)
          resolve({ file: compressedFile, preview })
        }, 'image/jpeg', quality)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function Uploader() {
  const { images, addImages, removeImage, reorderImages } = useStore()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((file) => {
        const isValidType = file.type.startsWith("image/")
        const isValidSize = file.size <= 4 * 1024 * 1024 // 4MB
        return isValidType && isValidSize
      })

      const imagePromises = validFiles.map(async (file) => {
        // Compress and resize before adding
        return await compressAndResizeImage(file)
      })

      Promise.all(imagePromises).then(addImages)
    },
    [addImages],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 100,
  })

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const startIndex = result.source.index
    const endIndex = result.destination.index

    reorderImages(startIndex, endIndex)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? "border-[#4CAF50] bg-[#4CAF50]/10" : "border-[#333] hover:border-[#4CAF50]/50"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto mb-4 text-[#666]" />
        {isDragActive ? (
          <p className="text-[#4CAF50]">Drop the images here...</p>
        ) : (
          <div>
            <p className="text-[#e0e0e0] mb-2">Drag & drop images here, or click to select</p>
            <p className="text-sm text-[#888]">Max 4MB per image, up to 100 images</p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
          {/* Manga Panels per Batch Counter */}
          <div className="flex justify-between items-center p-3 bg-[#2a2a2a] rounded border border-[#333]">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-[#4CAF50]">Manga Panels per Batch:</span>
              <div className="bg-[#1e1e1e] border border-[#333] rounded px-3 py-1 min-w-[60px] text-center">
                <span className="text-[#e0e0e0] font-mono">{images.length}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => useStore.getState().clearImages()}>
              Clear All
            </Button>
          </div>

          {/* Drag and Drop Image Grid */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="images" direction="horizontal">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2 bg-[#1e1e1e] rounded border border-[#333] image-grid-container"
                >
                  <AnimatePresence>
                    {images.map((image, index) => (
                      <Draggable key={`${image.file.name}-${index}`} draggableId={`image-${index}`} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className={`relative group aspect-square cursor-move image-grid-item ${
                              snapshot.isDragging ? "dragging" : ""
                            }`}
                            style={{
                              ...provided.draggableProps.style,
                              transform: snapshot.isDragging
                                ? `${provided.draggableProps.style?.transform} rotate(3deg) scale(1.05)`
                                : provided.draggableProps.style?.transform,
                            }}
                          >
                            <Image
                              src={image.preview || "/placeholder.svg"}
                              alt={`Panel ${index + 1}`}
                              fill
                              className={`object-cover rounded border-2 transition-all ${
                                snapshot.isDragging
                                  ? "border-[#4CAF50] shadow-lg shadow-[#4CAF50]/20"
                                  : "border-[#333] group-hover:border-[#4CAF50]/50"
                              }`}
                            />

                            {/* Remove Button */}
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeImage(index)
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>

                            {/* Priority Number */}
                            <div className="absolute bottom-1 left-1 bg-[#4CAF50] text-black text-xs font-bold px-2 py-1 rounded shadow-lg">
                              #{index + 1}
                            </div>

                            {/* Drag Handle Indicator */}
                            <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-4 h-4 bg-black/70 rounded flex items-center justify-center">
                                <div className="w-2 h-2 border border-white/50 rounded-sm"></div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* Reorder Instructions */}
          <div className="text-xs text-[#666] text-center p-2 bg-[#1e1e1e] rounded border border-[#333]">
            💡 Drag and drop images to reorder them. The generation will follow the order shown above.
          </div>
        </div>
      )}
    </div>
  )
}
