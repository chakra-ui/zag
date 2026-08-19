import { createHotkeyStore } from "@zag-js/hotkeys"
import { useEffect, useState } from "react"

const store = createHotkeyStore({
  activeScopes: ["editor"],
  conflictBehavior: "allow",
})

export default function ScopesPage() {
  const [activePanel, setActivePanel] = useState<"editor" | "terminal">("editor")
  const [editorLogs, setEditorLogs] = useState<string[]>([])
  const [terminalLogs, setTerminalLogs] = useState<string[]>([])

  const logTo = (target: "editor" | "terminal", message: string) => {
    const entry = `${new Date().toLocaleTimeString()}: ${message}`
    if (target === "editor") {
      setEditorLogs((prev) => [entry, ...prev.slice(0, 4)])
    } else {
      setTerminalLogs((prev) => [entry, ...prev.slice(0, 4)])
    }
  }

  useEffect(() => {
    store.register([
      // Same hotkey, different scopes
      {
        id: "editor-run",
        hotkey: "mod+Enter",
        label: "Run",
        action: () => logTo("editor", "Run code in editor"),
        scopes: ["editor"],
      },
      {
        id: "terminal-run",
        hotkey: "mod+Enter",
        label: "Run",
        action: () => logTo("terminal", "Execute command in terminal"),
        scopes: ["terminal"],
      },

      // Scope-specific shortcuts
      {
        id: "editor-format",
        hotkey: "Alt+Shift+F",
        label: "Format",
        action: () => logTo("editor", "Format code"),
        scopes: ["editor"],
      },
      {
        id: "terminal-clear",
        hotkey: "mod+K",
        label: "Clear",
        action: () => {
          setTerminalLogs([])
          logTo("terminal", "Terminal cleared")
        },
        scopes: ["terminal"],
      },
    ])

    store.init({ target: document })

    return () => store.destroy()
  }, [])

  const switchPanel = (panel: "editor" | "terminal") => {
    setActivePanel(panel)
    store.setScope(panel)
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "42rem", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Hotkey Scopes</h1>
      <p style={{ color: "#666", marginBottom: "1rem" }}>
        <kbd style={kbdStyle}>⌘ Enter</kbd> does different things depending on which panel is focused.
      </p>

      <div style={{ display: "flex", gap: "2px", marginBottom: "2px" }}>
        <Tab active={activePanel === "editor"} onClick={() => switchPanel("editor")}>
          Editor
        </Tab>
        <Tab active={activePanel === "terminal"} onClick={() => switchPanel("terminal")}>
          Terminal
        </Tab>
      </div>

      <div style={{ display: "flex", gap: "2px", minHeight: "220px" }}>
        <Panel
          active={activePanel === "editor"}
          label="Editor"
          hints={["⌘Enter — Run code", "Alt+Shift+F — Format"]}
          logs={editorLogs}
          onClick={() => switchPanel("editor")}
        />
        <Panel
          active={activePanel === "terminal"}
          label="Terminal"
          hints={["⌘Enter — Execute command", "⌘K — Clear"]}
          logs={terminalLogs}
          onClick={() => switchPanel("terminal")}
        />
      </div>

      <div style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#888" }}>
        Active scope: <strong style={{ color: "#333" }}>{activePanel}</strong>
      </div>
    </main>
  )
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 16px",
        fontSize: "0.8rem",
        fontWeight: active ? 600 : 400,
        backgroundColor: active ? "#1e1e1e" : "#e5e5e5",
        color: active ? "#fff" : "#666",
        border: "none",
        borderRadius: "6px 6px 0 0",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  )
}

function Panel({
  active,
  hints,
  logs,
  onClick,
}: {
  active: boolean
  label: string
  hints: string[]
  logs: string[]
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        padding: "12px",
        backgroundColor: active ? "#1e1e1e" : "#f5f5f5",
        color: active ? "#d4d4d4" : "#999",
        borderRadius: "0 0 6px 6px",
        fontFamily: "monospace",
        fontSize: "0.8rem",
        cursor: "pointer",
        border: active ? "1px solid #333" : "1px solid #ddd",
        transition: "all 0.15s",
      }}
    >
      <div style={{ marginBottom: "8px", color: active ? "#888" : "#bbb" }}>
        {hints.map((h, i) => (
          <div key={i}>{h}</div>
        ))}
      </div>
      {logs.map((log, i) => (
        <div key={i} style={{ color: active ? "#00ff00" : "#aaa" }}>
          {log}
        </div>
      ))}
      {logs.length === 0 && <div style={{ fontStyle: "italic", color: "#666" }}>No events yet...</div>}
    </div>
  )
}

const kbdStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "2px 6px",
  fontSize: "0.8rem",
  fontFamily: "monospace",
  backgroundColor: "#f0f0f0",
  border: "1px solid #ccc",
  borderRadius: "4px",
  boxShadow: "0 1px 0 #ccc",
}
