import { autoresizeTextarea } from "@zag-js/auto-resize"
import { onSettled } from "solid-js"

export default function Page() {
  let textareaRef: HTMLTextAreaElement | undefined

  onSettled(() => {
    if (!textareaRef) return
    const cleanup = autoresizeTextarea(textareaRef)
    return () => cleanup?.()
  })

  return (
    <main>
      <textarea
        ref={textareaRef}
        rows={4}
        style={{
          width: "100%",
          resize: "none",
          padding: "20px",
          "scroll-padding-block": "20px",
          "max-height": "180px",
        }}
      />
    </main>
  )
}
