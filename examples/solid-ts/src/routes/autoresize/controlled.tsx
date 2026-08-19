import { autoresizeTextarea } from "@zag-js/auto-resize"
import { createSignal, onCleanup, onMount } from "solid-js"

export default function Page() {
  let textareaRef: HTMLTextAreaElement | undefined
  const [value, setValue] = createSignal("")

  onMount(() => {
    if (!textareaRef) return
    const cleanup = autoresizeTextarea(textareaRef)
    onCleanup(() => cleanup?.())
  })

  return (
    <main style={{ padding: "20px", "max-width": "600px" }}>
      <h1>Autoresize Controlled Textarea</h1>
      <p>Type a character, click Clear, then type the same character again. The value should update each time.</p>

      <textarea
        ref={textareaRef}
        value={value()}
        rows={2}
        placeholder="Type something..."
        style={{
          width: "100%",
          resize: "none",
          padding: "12px",
          "font-size": "16px",
          "border-radius": "8px",
          border: "1px solid #ccc",
        }}
        onInput={(e) => setValue(e.currentTarget.value)}
      />

      <div style={{ "margin-top": "12px" }}>
        <button
          type="button"
          style={{ padding: "8px 16px", "font-size": "14px", cursor: "pointer" }}
          onClick={() => setValue("")}
        >
          Clear the field
        </button>
      </div>

      <div style={{ "margin-top": "20px" }}>
        <strong>Value from state:</strong>
        <pre
          data-testid="value"
          style={{ background: "#f5f5f5", padding: "12px", "border-radius": "4px", "min-height": "40px" }}
        >
          {JSON.stringify(value())}
        </pre>
      </div>
    </main>
  )
}
