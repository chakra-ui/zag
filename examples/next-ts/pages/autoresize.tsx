import { autoresizeTextarea } from "@zag-js/auto-resize"
import { useEffect, useRef } from "react"

export default function Autoresize() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    return autoresizeTextarea(textareaRef.current)
  }, [])
  return (
    <main>
      <textarea
        ref={textareaRef}
        rows={4}
        style={{
          width: "100%",
          resize: "none",
          padding: 20,
          scrollPaddingBlock: 20,
          maxHeight: 180,
        }}
      />
    </main>
  )
}
