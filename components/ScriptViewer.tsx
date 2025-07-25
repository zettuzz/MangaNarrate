"use client"

import { useStore } from "@/store/useStore"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"

export function ScriptViewer() {
  const { script } = useStore()

  if (!script) {
    return (
      <div className="h-96 flex items-center justify-center text-[#666]">
        <div className="text-center">
          <div className="text-4xl mb-4">📝</div>
          <p>Your generated script will appear here</p>
          <p className="text-sm mt-2">Upload images and click "Generate Script" to start</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-96">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert max-w-none">
        <div className="whitespace-pre-wrap text-[#e0e0e0] leading-relaxed">{script}</div>
      </motion.div>
    </ScrollArea>
  )
}
