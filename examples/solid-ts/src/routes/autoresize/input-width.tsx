import { autoResizeInput } from "@zag-js/auto-resize"
import { onSettled } from "solid-js"
import "@styles/autoresize.css"

export default function Page() {
  let inputRef: HTMLInputElement | undefined

  onSettled(() => {
    if (!inputRef) return
    const cleanup = autoResizeInput(inputRef)
    return () => {
      if (cleanup) cleanup()
    }
  })

  return (
    <main>
      <div class="autoresize-input-width">
        <p class="hint">Rename the board. The field is as wide as its name.</p>
        <label>
          <span>Board name</span>
          <input ref={inputRef} value="Roadmap" spellcheck={false} />
        </label>
      </div>
    </main>
  )
}
