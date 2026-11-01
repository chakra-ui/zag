import {
  createHotkeyRecorder,
  formatHotkey,
  isHotkeyEqual,
  type HotkeyRecorder,
  type RecordedHotkey,
} from "@zag-js/hotkeys"
import { createSignal, For, onCleanup, onMount, Show, type JSX } from "solid-js"

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

export default function Page() {
  const [bindings, setBindings] = createSignal<ShortcutBinding[]>([
    makeBinding("save", "Save", "mod+S"),
    makeBinding("undo", "Undo", "mod+Z"),
    makeBinding("redo", "Redo"),
    makeBinding("search", "Search"),
    makeBinding("palette", "Command Palette"),
  ])
  const [editingId, setEditingId] = createSignal<string | null>(null)
  const [conflict, setConflict] = createSignal<string | null>(null)

  let recorder: HotkeyRecorder | undefined

  onMount(() => {
    recorder = createHotkeyRecorder({ target: document })
    // Callbacks read signals at call time, so they never go stale
    recorder.setOptions({
      onRecord(hotkey) {
        const existing = bindings().find(
          (b) => b.id !== editingId() && b.hotkey && isHotkeyEqual(b.hotkey.value, hotkey.value),
        )
        if (existing) {
          setConflict(`"${hotkey.display}" is already used by ${existing.label}`)
          recorder?.start()
          return
        }
        setConflict(null)
        const id = editingId()
        setBindings((prev) => prev.map((b) => (b.id === id ? { ...b, hotkey } : b)))
        setEditingId(null)
      },
      onCancel() {
        setConflict(null)
        setEditingId(null)
      },
    })
  })

  onCleanup(() => recorder?.destroy())

  return (
    <main style={{ padding: "2rem", "max-width": "42rem", margin: "0 auto" }}>
      <h1 style={{ "font-size": "1.5rem", "font-weight": "bold", "margin-bottom": "0.5rem" }}>Key Recorder</h1>
      <p style={{ color: "#666", "margin-bottom": "1.5rem" }}>Click a shortcut to record a new key combination.</p>

      <div style={{ display: "flex", "flex-direction": "column", gap: "2px" }}>
        <For each={bindings()}>
          {(binding) => {
            const isEditing = () => editingId() === binding.id
            return (
              <div
                style={{
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "space-between",
                  padding: "10px 14px",
                  "background-color": isEditing() ? "#fff7ed" : "#fafafa",
                  border: isEditing() ? "1px solid #f97316" : "1px solid transparent",
                  "border-radius": "6px",
                }}
              >
                <span style={{ "font-size": "0.9rem", "font-weight": 500 }}>{binding.label}</span>

                <div style={{ display: "flex", "align-items": "center", gap: "8px" }}>
                  <Show
                    when={isEditing()}
                    fallback={
                      <>
                        <button
                          onClick={() => {
                            setConflict(null)
                            setEditingId(binding.id)
                            recorder?.start()
                          }}
                          style={{ ...kbdBtnStyle, color: binding.hotkey ? "#333" : "#999" }}
                        >
                          {binding.hotkey?.display || "Unset"}
                        </button>
                        <Show when={binding.hotkey}>
                          <button
                            onClick={() => {
                              setBindings((prev) => prev.map((b) => (b.id === binding.id ? { ...b, hotkey: null } : b)))
                            }}
                            style={smallBtnStyle}
                          >
                            Clear
                          </button>
                        </Show>
                      </>
                    }
                  >
                    <span
                      style={{
                        "font-size": "0.8rem",
                        color: conflict() ? "#ef4444" : "#f97316",
                        "font-style": "italic",
                      }}
                    >
                      {conflict() || "Press a key combo..."}
                    </span>
                    <button onClick={() => recorder?.cancel()} style={smallBtnStyle}>
                      Cancel
                    </button>
                  </Show>
                </div>
              </div>
            )
          }}
        </For>
      </div>

      <div style={{ "margin-top": "2rem", padding: "1rem", "background-color": "#f5f5f5", "border-radius": "8px" }}>
        <h3 style={{ "font-size": "0.85rem", "font-weight": 600, "margin-bottom": "0.5rem", color: "#666" }}>
          Current Bindings
        </h3>
        <pre style={{ "font-size": "0.8rem", margin: 0, overflow: "auto" }}>
          {JSON.stringify(
            bindings().map((b) => ({ id: b.id, hotkey: b.hotkey?.value ?? null })),
            null,
            2,
          )}
        </pre>
      </div>
    </main>
  )
}

const kbdBtnStyle: JSX.CSSProperties = {
  padding: "4px 10px",
  "font-size": "0.8rem",
  "font-family": "monospace",
  "background-color": "#fff",
  border: "1px solid #ddd",
  "border-radius": "4px",
  "box-shadow": "0 1px 0 #eee",
  cursor: "pointer",
  "min-width": "80px",
  "text-align": "center",
}

const smallBtnStyle: JSX.CSSProperties = {
  padding: "3px 8px",
  "font-size": "0.75rem",
  "background-color": "transparent",
  border: "1px solid #ddd",
  "border-radius": "4px",
  cursor: "pointer",
  color: "#888",
}
