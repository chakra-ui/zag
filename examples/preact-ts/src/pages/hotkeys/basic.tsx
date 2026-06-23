import { createHotkeyStore, formatHotkey, type HotkeyCommand } from "@zag-js/hotkeys"
import { useEffect, useState } from "react"

const store = createHotkeyStore()

export default function HotkeysPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [commands, setCommands] = useState<HotkeyCommand[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)])
  }

  useEffect(() => {
    store.register([
      {
        id: "save",
        hotkey: "mod+S",
        label: "Save",
        action: () => addLog("mod+S: Save"),
        options: { preventDefault: true },
      },
      { id: "undo", hotkey: "mod+Z", label: "Undo", action: () => addLog("mod+Z: Undo") },
      { id: "redo", hotkey: "mod+shift+Z", label: "Redo", action: () => addLog("mod+shift+Z: Redo") },
      { id: "escape", hotkey: "Escape", label: "Close", action: () => addLog("Escape: Close") },
    ])

    store.init({ target: document })
    setCommands(Array.from(store.getState().commands.values()))

    return () => store.destroy()
  }, [])

  return (
    <main style={{ padding: "2rem", maxWidth: "42rem", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Hotkeys Example</h1>

      <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "0.5rem" }}>
        <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
          {commands.map((cmd) => (
            <li key={cmd.id}>
              <code>{formatHotkey(cmd.hotkey, { platform: "mac" })}</code> : {cmd.label || cmd.id}
            </li>
          ))}
        </ul>
      </div>

      <div
        style={{
          backgroundColor: "#000",
          color: "#00ff00",
          padding: "1rem",
          borderRadius: "0.5rem",
          fontFamily: "monospace",
        }}
      >
        <div style={{ marginBottom: "0.5rem", color: "#888" }}>Event Log:</div>
        {logs.map((log, i) => (
          <div key={i} style={{ fontSize: "0.8rem" }}>
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <div style={{ color: "#666", fontStyle: "italic" }}>Press any hotkey to see events...</div>
        )}
      </div>
    </main>
  )
}
