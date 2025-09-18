import { createHotkeyStore } from "@zag-js/hotkeys"
import { useEffect, useState } from "react"

// Define the context type for better TypeScript support
interface AppContext {
  user: string
  theme: "dark" | "light"
  zoomLevel: number
}

// Demo: New Store-based API (decoupled instantiation from initialization)
const store = createHotkeyStore<AppContext>({
  defaultActiveScopes: ["global", "editor"], // Start with multiple active scopes
})

export default function HotkeysPage() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)])
  }

  useEffect(() => {
    // Initialize with root node and context
    store.initialize({
      rootNode: document,
      defaultContext: {
        user: "demo-user",
        theme: "dark",
        zoomLevel: 1.0,
      },
    })

    store.register([
      {
        id: "store-save",
        hotkey: "Alt+S",
        label: "Save Document",
        description: "Save the current document with context",
        category: "file",
        keywords: ["save", "persist", "store"],
        action: async (context) => {
          addLog(`Store API: Save by ${context.user} (zoom: ${context.zoomLevel})`)
        },
      },
      {
        id: "store-zoom-in",
        hotkey: "Alt++",
        label: "Zoom In",
        description: "Increase zoom level",
        category: "view",
        keywords: ["zoom", "scale", "magnify"],
        action: async (context) => {
          const newZoom = context.zoomLevel * 1.1
          store.setContext({ ...context, zoomLevel: newZoom })
          addLog(`Store API: Zoom in to ${newZoom.toFixed(1)}x`)
        },
      },
      {
        id: "toggle-theme",
        hotkey: "Alt+T",
        action: async (context) => {
          const newTheme = context.theme === "dark" ? "light" : "dark"
          store.setContext({ ...context, theme: newTheme })
          addLog(`Theme switched to ${newTheme} (F1 help ${newTheme === "dark" ? "enabled" : "disabled"})`)
        },
      },
      {
        id: "toggle-editor-scope",
        hotkey: "Alt+E",
        action: () => {
          store.toggleScope("editor")
          const scopes = store.getActiveScopes()
          const editorActive = scopes.includes("editor")
          addLog(
            `Editor scope ${editorActive ? "enabled" : "disabled"} (Alt+Shift+F ${editorActive ? "available" : "unavailable"})`,
          )
        },
      },
      // Playwright-style key naming (preferred)
      {
        id: "command-palette",
        hotkey: "Control+K",
        action: () => addLog("Ctrl+K - Command palette"),
      },
      {
        id: "close-modal",
        hotkey: "Escape",
        action: () => addLog("Escape - Close modal"),
      },
      {
        id: "go-home",
        hotkey: "G > H",
        action: () => addLog("G then H - Go home"),
      },
      // Cross-platform modifiers
      {
        id: "submit",
        hotkey: "ControlOrMeta+Enter",
        action: () => addLog("Ctrl/Cmd+Enter - Submit"),
        options: { enableOnFormTags: true },
      },
      {
        id: "input-only-hotkey",
        hotkey: "Control+I",
        action: () => addLog("Ctrl+I - Input only (works only in input fields)"),
        options: { enableOnFormTags: ["input"] }, // Only works in input elements
      },
      {
        id: "save",
        hotkey: "mod+S",
        action: () => addLog("Save (Ctrl/Cmd+S)"),
      },
      // Plus key support (NEW!)
      {
        id: "zoom-in",
        hotkey: "Control++",
        action: () => addLog("Ctrl/Cmd+Plus - Zoom in"),
      },
      {
        id: "plus-key",
        hotkey: "+",
        action: () => addLog("Plus key pressed"),
      },
      {
        id: "shift-plus",
        hotkey: "Shift++",
        action: () => addLog("Shift+Plus pressed"),
      },
      // Arrow keys - both styles work
      {
        id: "arrow-up",
        hotkey: "ArrowUp",
        action: () => addLog("Arrow Up pressed"),
      },
      {
        id: "shift-arrow-down",
        hotkey: "shift+down",
        action: () => addLog("Shift+Arrow Down pressed"), // lowercase also works
      },
      // Function keys
      {
        id: "help",
        hotkey: "F1",
        action: () => addLog("F1 - Help"),
        scopes: ["global", "help"],
        enabled: (context) => context.theme === "dark", // Only enabled in dark theme
      },
      {
        id: "editor-format",
        hotkey: "Alt+Shift+F",
        action: () => addLog("Alt+Shift+F - Format code (editor scope)"),
        scopes: ["editor"], // Only works in editor scope
      },
      // Common aliases are supported for convenience
      {
        id: "undo",
        hotkey: "ctrl+z",
        action: () => addLog("Undo"), // lowercase works
      },
      {
        id: "redo",
        hotkey: "cmd+shift+z",
        action: () => addLog("Redo"), // cmd = Meta on Mac
      },
    ])

    return () => {
      store.destroy()
    }
  }, [])

  return (
    <main style={{ padding: "2rem", maxWidth: "42rem", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Hotkeys Example</h1>

      <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "0.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "0.5rem" }}>Try these hotkeys:</h2>
        <div style={{ fontSize: "0.9rem" }}>
          <strong>Available Hotkeys:</strong>
          <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
            <li>
              <code>Alt+S</code> - Save with context
            </li>
            <li>
              <code>Alt++</code> - Zoom in (updates context)
            </li>
            <li>
              <code>Alt+T</code> - Toggle theme (affects F1 availability)
            </li>
            <li>
              <code>Alt+E</code> - Toggle editor scope (affects Alt+Shift+F)
            </li>
            <li>
              <code>Ctrl+K</code> - Command palette
            </li>
            <li>
              <code>Escape</code> - Close modal
            </li>
            <li>
              <code>G then H</code> - Go home (sequence)
            </li>
            <li>
              <code>Ctrl/Cmd+Enter</code> - Submit (works in all form fields)
            </li>
            <li>
              <code>Ctrl+I</code> - Input only (works only in input fields)
            </li>
            <li>
              <code>Ctrl/Cmd+S</code> - Save
            </li>
            <li>
              <code>Ctrl/Cmd++</code> - Zoom in
            </li>
            <li>
              <code>+</code> - Plus key
            </li>
            <li>
              <code>↑</code> - Arrow up
            </li>
            <li>
              <code>Shift+↓</code> - Shift+Arrow down
            </li>
            <li>
              <code>F1</code> - Help (only in dark theme)
            </li>
            <li>
              <code>Alt+Shift+F</code> - Format code (editor scope)
            </li>
            <li>
              <code>Ctrl+Z</code> - Undo
            </li>
            <li>
              <code>Cmd+Shift+Z</code> - Redo
            </li>
          </ul>
        </div>
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
