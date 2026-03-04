import { autoresizeTextarea } from "@zag-js/auto-resize"
import { useEffect, useRef, useState } from "react"

export default function AutoresizeControlled() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [value, setValue] = useState("")

  useEffect(() => {
    return autoresizeTextarea(textareaRef.current)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log("onChange fired:", e.target.value)
    setValue(e.target.value)
  }

  const handleClear = () => {
    console.log("Clear button clicked")
    setValue("")
  }

  return (
    <main style={{ padding: 20, maxWidth: 600 }}>
      <h1>Autoresize Controlled Textarea</h1>
      <p>
        Test: Type a character, click Clear, then type the same character again. The onChange should fire each time.
      </p>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder="Type something..."
        rows={2}
        style={{
          width: "100%",
          resize: "none",
          padding: 12,
          fontSize: 16,
          borderRadius: 8,
          border: "1px solid #ccc",
        }}
      />

      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <button
          onClick={handleClear}
          style={{
            padding: "8px 16px",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Clear the field
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <strong>Value from state:</strong>
        <pre
          style={{
            background: "#f5f5f5",
            padding: 12,
            borderRadius: 4,
            minHeight: 40,
          }}
        >
          {JSON.stringify(value)}
        </pre>
      </div>

      <div style={{ marginTop: 20, color: "#666", fontSize: 14 }}>
        <strong>Instructions:</strong>
        <ol>
          <li>Type any single character (e.g., "a")</li>
          <li>Click "Clear the field" button</li>
          <li>Type the same character again</li>
          <li>
            <strong>Expected:</strong> onChange fires, state updates to "a"
          </li>
          <li>
            <strong>Bug (before fix):</strong> onChange doesn't fire, state stays empty
          </li>
        </ol>
        <p>Check the browser console for onChange logs.</p>
      </div>
    </main>
  )
}
