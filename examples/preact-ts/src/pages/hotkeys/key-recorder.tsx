import {
  createHotkeyRecorder,
  type HotkeyRecorder,
  formatHotkey,
  isHotkeyEqual,
  type RecordedHotkey,
} from "@zag-js/hotkeys"
import { useEffect, useRef, useState } from "react"

interface ShortcutBinding {
  id: string
  label: string
  hotkey: RecordedHotkey | null
}

function makeBinding(id: string, label: string, hotkey?: string): ShortcutBinding {
  return {
    id,
    label,
    hotkey: hotkey ? { value: hotkey, display: formatHotkey(hotkey, { platform: "mac" }) } : null,
  }
}

export default function KeyRecorderPage() {
  const [bindings, setBindings] = useState<ShortcutBinding[]>(() => [
    makeBinding("save", "Save", "mod+S"),
    makeBinding("undo", "Undo", "mod+Z"),
    makeBinding("redo", "Redo"),
    makeBinding("search", "Search"),
    makeBinding("palette", "Command Palette"),
  ])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [conflict, setConflict] = useState<string | null>(null)

  const recorderRef = useRef<HotkeyRecorder | null>(null)

  useEffect(() => {
    recorderRef.current = createHotkeyRecorder({ target: document })
    return () => recorderRef.current?.destroy()
  }, [])

  // Keep callbacks in sync with current state — no refs needed
  recorderRef.current?.setOptions({
    onRecord(hotkey) {
      const existing = bindings.find(
        (b) => b.id !== editingId && b.hotkey && isHotkeyEqual(b.hotkey.value, hotkey.value),
      )
      if (existing) {
        setConflict(`"${hotkey.display}" is already used by ${existing.label}`)
        recorderRef.current?.start()
        return
      }
      setConflict(null)
      setBindings((prev) => prev.map((b) => (b.id === editingId ? { ...b, hotkey } : b)))
      setEditingId(null)
    },
    onCancel() {
      setConflict(null)
      setEditingId(null)
    },
  })

  return (
    <main style={{ padding: "2rem", maxWidth: "42rem", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Key Recorder</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>Click a shortcut to record a new key combination.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        {bindings.map((binding) => {
          const isEditing = editingId === binding.id
          return (
            <div
              key={binding.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                backgroundColor: isEditing ? "#fff7ed" : "#fafafa",
                border: isEditing ? "1px solid #f97316" : "1px solid transparent",
                borderRadius: "6px",
              }}
            >
              <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{binding.label}</span>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {isEditing ? (
                  <>
                    <span style={{ fontSize: "0.8rem", color: conflict ? "#ef4444" : "#f97316", fontStyle: "italic" }}>
                      {conflict || "Press a key combo..."}
                    </span>
                    <button onClick={() => recorderRef.current?.cancel()} style={smallBtnStyle}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setConflict(null)
                        setEditingId(binding.id)
                        recorderRef.current?.start()
                      }}
                      style={{ ...kbdBtnStyle, color: binding.hotkey ? "#333" : "#999" }}
                    >
                      {binding.hotkey?.display || "Unset"}
                    </button>
                    {binding.hotkey && (
                      <button
                        onClick={() => {
                          setBindings((prev) => prev.map((b) => (b.id === binding.id ? { ...b, hotkey: null } : b)))
                        }}
                        style={smallBtnStyle}
                      >
                        Clear
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
        <h3 style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem", color: "#666" }}>
          Current Bindings
        </h3>
        <pre style={{ fontSize: "0.8rem", margin: 0, overflow: "auto" }}>
          {JSON.stringify(
            bindings.map((b) => ({ id: b.id, hotkey: b.hotkey?.value ?? null })),
            null,
            2,
          )}
        </pre>
      </div>
    </main>
  )
}

const kbdBtnStyle: React.CSSProperties = {
  padding: "4px 10px",
  fontSize: "0.8rem",
  fontFamily: "monospace",
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  borderRadius: "4px",
  boxShadow: "0 1px 0 #eee",
  cursor: "pointer",
  minWidth: "80px",
  textAlign: "center",
}

const smallBtnStyle: React.CSSProperties = {
  padding: "3px 8px",
  fontSize: "0.75rem",
  backgroundColor: "transparent",
  border: "1px solid #ddd",
  borderRadius: "4px",
  cursor: "pointer",
  color: "#888",
}
