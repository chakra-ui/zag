import { autoresizeTextarea } from "@zag-js/auto-resize"
import { useEffect, useRef, useState } from "preact/hooks"

export default function Page() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState("")

  useEffect(() => {
    return autoresizeTextarea(textareaRef.current)
  }, [])

  return (
    <main style={{ padding: 20, maxWidth: 600 }}>
      <h1>Autoresize Controlled Textarea</h1>
      <p>Type a character, click Clear, then type the same character again. The value should update each time.</p>

      <textarea
        ref={textareaRef}
        value={value}
        rows={2}
        placeholder="Type something..."
        style={{
          width: "100%",
          resize: "none",
          padding: 12,
          fontSize: 16,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
        onInput={(e) => setValue((e.currentTarget as HTMLTextAreaElement).value)}
      />

      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          style={{ padding: "8px 16px", fontSize: 14, cursor: "pointer" }}
          onClick={() => setValue("")}
        >
          Clear the field
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Value from state:</strong>
        <pre data-testid="value" style={{ background: "#f5f5f5", padding: 12, borderRadius: 4, minHeight: 40 }}>
          {JSON.stringify(value)}
        </pre>
      </div>
    </main>
  )
}
