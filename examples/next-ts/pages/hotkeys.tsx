import { createHotkeyStore, formatHotkey } from "@zag-js/hotkeys"
import { useEffect, useState } from "react"

interface AppContext {
  user: string
  theme: "dark" | "light"
  zoomLevel: number
  log: (message: string) => void
}

const store = createHotkeyStore<AppContext>({
  activeScopes: ["global", "editor"],
})

store.register([
  {
    id: "store-save",
    hotkey: "Alt+S",
    label: "Save Document",
    description: "Save the current document with context",
    category: "file",
    keywords: ["save", "persist", "store"],
    action: async (ctx) => {
      ctx.log(`Store API: Save by ${ctx.user} (zoom: ${ctx.zoomLevel})`)
    },
  },
  {
    id: "change-theme",
    hotkey: "K > T",
    label: "Change Theme",
    description: "Change the current theme",
    category: "file",
    keywords: ["change", "theme"],
    action: async (ctx) => {
      ctx.log(`Store API: Change theme to ${ctx.theme}`)
    },
  },
  {
    id: "store-zoom-in",
    hotkey: "Alt++",
    label: "Zoom In",
    description: "Increase zoom level",
    category: "view",
    keywords: ["zoom", "scale", "magnify"],
    action: async (ctx) => {
      const newZoom = ctx.zoomLevel * 1.1
      store.setContext({ ...ctx, zoomLevel: newZoom })
      ctx.log(`Store API: Zoom in to ${newZoom.toFixed(1)}x`)
    },
  },
  {
    id: "toggle-theme",
    hotkey: "Alt+T",
    label: "Toggle Theme",
    description: "Switch between dark and light themes",
    action: async (ctx) => {
      const newTheme = ctx.theme === "dark" ? "light" : "dark"
      store.setContext({ ...ctx, theme: newTheme, log: ctx.log })
      ctx.log(`Theme switched to ${newTheme} (F1 help ${newTheme === "dark" ? "enabled" : "disabled"})`)
    },
  },
  {
    id: "toggle-editor-scope",
    hotkey: "Alt+E",
    label: "Toggle Editor Scope",
    description: "Enable/disable editor-specific hotkeys",
    action: (ctx) => {
      store.toggleScope("editor")
      const scopes = store.getActiveScopes()
      const editorActive = scopes.includes("editor")
      ctx.log(
        `Editor scope ${editorActive ? "enabled" : "disabled"} (Alt+Shift+F ${editorActive ? "available" : "unavailable"})`,
      )
    },
  },
  {
    id: "command-palette",
    hotkey: "Control+K",
    label: "Command Palette",
    description: "Open command palette",
    action: (ctx) => ctx.log("Ctrl+K - Command palette"),
  },
  {
    id: "close-modal",
    hotkey: "Escape",
    label: "Close Modal",
    description: "Close any open modal or dialog",
    action: (ctx) => ctx.log("Escape - Close modal"),
  },
  {
    id: "go-home",
    hotkey: "G > H",
    label: "Go Home",
    description: "Navigate to home page (sequence)",
    action: (ctx) => ctx.log("G then H - Go home"),
  },
  {
    id: "submit",
    hotkey: "ControlOrMeta+Enter",
    label: "Submit Form",
    description: "Submit current form (works in form fields)",
    action: (ctx) => ctx.log("Ctrl/Cmd+Enter - Submit"),
    options: { enableOnFormTags: true },
  },
  {
    id: "input-only-hotkey",
    hotkey: "Control+I",
    label: "Input Only Action",
    description: "Special action that only works in input fields",
    action: (ctx) => ctx.log("Ctrl+I - Input only (works only in input fields)"),
    options: { enableOnFormTags: ["input"] },
  },
  {
    id: "save",
    hotkey: "mod+S",
    label: "Save Document",
    description: "Save current document",
    action: (ctx) => ctx.log("Save (Ctrl/Cmd+S)"),
    options: { preventDefault: true },
  },
  {
    id: "zoom-in",
    hotkey: "mod++",
    label: "Zoom In (Alternative)",
    description: "Increase zoom level using plus key",
    action: (ctx) => ctx.log("Ctrl/Cmd+Plus - Zoom in"),
    options: { preventDefault: true },
  },
  {
    id: "plus-key",
    hotkey: "+",
    label: "Plus Key",
    description: "Simple plus key press",
    action: (ctx) => ctx.log("Plus key pressed"),
  },
  {
    id: "shift-plus",
    hotkey: "Shift++",
    label: "Shift + Plus",
    description: "Shift modifier with plus key",
    action: (ctx) => ctx.log("Shift+Plus pressed"),
  },
  {
    id: "arrow-up",
    hotkey: "ArrowUp",
    label: "Arrow Up",
    description: "Navigate up",
    action: (ctx) => ctx.log("Arrow Up pressed"),
  },
  {
    id: "shift-arrow-down",
    hotkey: "shift+down",
    label: "Shift + Arrow Down",
    description: "Navigate down with selection",
    action: (ctx) => ctx.log("Shift+Arrow Down pressed"),
  },
  {
    id: "help",
    hotkey: "F1",
    label: "Help",
    description: "Show help (only in dark theme)",
    action: (ctx) => ctx.log("F1 - Help"),
    scopes: ["global", "help"],
    enabled: (ctx) => ctx.theme === "dark",
  },
  {
    id: "editor-format",
    hotkey: "Alt+Shift+F",
    label: "Format Code",
    description: "Format code in editor (editor scope only)",
    action: (ctx) => ctx.log("Alt+Shift+F - Format code (editor scope)"),
    scopes: ["editor"],
  },
  {
    id: "undo",
    hotkey: "ctrl+z",
    label: "Undo",
    description: "Undo last action",
    action: (ctx) => ctx.log("Undo"),
  },
  {
    id: "redo",
    hotkey: "cmd+shift+z",
    label: "Redo",
    description: "Redo last undone action",
    action: (ctx) => ctx.log("Redo"),
  },
])

export default function HotkeysPage() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)])
  }

  useEffect(() => {
    store.init({
      rootNode: document,
      context: {
        user: "demo-user",
        theme: "dark",
        zoomLevel: 1.0,
        log: addLog,
      },
    })

    return () => {
      store.destroy()
    }
  }, [])

  return (
    <main style={{ padding: "2rem", maxWidth: "42rem", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Hotkeys Example</h1>

      <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "0.5rem" }}>
        <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
          {Array.from(store.getState().commands.values()).map((command) => {
            const displayHotkey = formatHotkey(command.hotkey, { platform: "mac" })
            return (
              <li key={command.id}>
                <code>{displayHotkey}</code> : {command.label || command.id}
              </li>
            )
          })}
        </ul>
      </div>

      <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f0f8ff", borderRadius: "0.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.5rem" }}>Test Form Elements:</h3>
        <div style={{ display: "flex", gap: "1rem", flexDirection: "column" }}>
          <input
            type="text"
            placeholder="Input field - try Ctrl+I and Ctrl/Cmd+Enter here"
            style={{ padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #ccc" }}
          />
          <textarea
            placeholder="Textarea - try Ctrl/Cmd+Enter here (Ctrl+I won't work)"
            rows={3}
            style={{ padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #ccc", resize: "vertical" }}
          />
          <select style={{ padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #ccc" }}>
            <option>Select dropdown - try Ctrl/Cmd+Enter here</option>
            <option>Option 2</option>
          </select>
        </div>
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
