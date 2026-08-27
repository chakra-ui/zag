import { autoresizeTextarea } from "@zag-js/auto-resize"
import { onCleanup, onMount } from "solid-js"

export default function Page() {
  let textareaRef: HTMLTextAreaElement | undefined

  onMount(() => {
    if (!textareaRef) return
    const cleanup = autoresizeTextarea(textareaRef)
    onCleanup(() => cleanup?.())
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
