import { createHotkeyStore } from "@zag-js/hotkeys"
import { createSignal, Index, onCleanup, onMount, Show, type JSX } from "solid-js"

const store = createHotkeyStore({
  activeScopes: ["editor"],
  conflictBehavior: "allow",
})

export default function Page() {
  const [activePanel, setActivePanel] = createSignal<"editor" | "terminal">("editor")
  const [editorLogs, setEditorLogs] = createSignal<string[]>([])
  const [terminalLogs, setTerminalLogs] = createSignal<string[]>([])

  const logTo = (target: "editor" | "terminal", message: string) => {
    const entry = `${new Date().toLocaleTimeString()}: ${message}`
    if (target === "editor") {
      setEditorLogs((prev) => [entry, ...prev.slice(0, 4)])
    } else {
      setTerminalLogs((prev) => [entry, ...prev.slice(0, 4)])
    }
  }

  onMount(() => {
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
  })

  onCleanup(() => store.destroy())

  const switchPanel = (panel: "editor" | "terminal") => {
    setActivePanel(panel)
    store.setScope(panel)
  }

  return (
    <main style={{ padding: "2rem", "max-width": "42rem", margin: "0 auto" }}>
      <h1 style={{ "font-size": "1.5rem", "font-weight": "bold", "margin-bottom": "0.5rem" }}>Hotkey Scopes</h1>
      <p style={{ color: "#666", "margin-bottom": "1rem" }}>
        <kbd style={kbdStyle}>⌘ Enter</kbd> does different things depending on which panel is focused.
      </p>

      <div style={{ display: "flex", gap: "2px", "margin-bottom": "2px" }}>
        <Tab active={activePanel() === "editor"} onClick={() => switchPanel("editor")}>
          Editor
        </Tab>
        <Tab active={activePanel() === "terminal"} onClick={() => switchPanel("terminal")}>
          Terminal
        </Tab>
      </div>

      <div style={{ display: "flex", gap: "2px", "min-height": "220px" }}>
        <Panel
          active={activePanel() === "editor"}
          label="Editor"
          hints={["⌘Enter — Run code", "Alt+Shift+F — Format"]}
          logs={editorLogs()}
          onClick={() => switchPanel("editor")}
        />
        <Panel
          active={activePanel() === "terminal"}
          label="Terminal"
          hints={["⌘Enter — Execute command", "⌘K — Clear"]}
          logs={terminalLogs()}
          onClick={() => switchPanel("terminal")}
        />
      </div>

      <div style={{ "margin-top": "1rem", "font-size": "0.8rem", color: "#888" }}>
        Active scope: <strong style={{ color: "#333" }}>{activePanel()}</strong>
      </div>
    </main>
  )
}

function Tab(props: { active: boolean; onClick: () => void; children: JSX.Element }) {
  return (
    <button
      onClick={() => props.onClick()}
      style={{
        padding: "6px 16px",
        "font-size": "0.8rem",
        "font-weight": props.active ? 600 : 400,
        "background-color": props.active ? "#1e1e1e" : "#e5e5e5",
        color: props.active ? "#fff" : "#666",
        border: "none",
        "border-radius": "6px 6px 0 0",
        cursor: "pointer",
      }}
    >
      {props.children}
    </button>
  )
}

function Panel(props: { active: boolean; label: string; hints: string[]; logs: string[]; onClick: () => void }) {
  return (
    <div
      onClick={() => props.onClick()}
      style={{
        flex: 1,
        padding: "12px",
        "background-color": props.active ? "#1e1e1e" : "#f5f5f5",
        color: props.active ? "#d4d4d4" : "#999",
        "border-radius": "0 0 6px 6px",
        "font-family": "monospace",
        "font-size": "0.8rem",
        cursor: "pointer",
        border: props.active ? "1px solid #333" : "1px solid #ddd",
        transition: "all 0.15s",
      }}
    >
      <div style={{ "margin-bottom": "8px", color: props.active ? "#888" : "#bbb" }}>
        <Index each={props.hints}>{(h) => <div>{h()}</div>}</Index>
      </div>
      <Index each={props.logs}>
        {(log) => <div style={{ color: props.active ? "#00ff00" : "#aaa" }}>{log()}</div>}
      </Index>
      <Show when={props.logs.length === 0}>
        <div style={{ "font-style": "italic", color: "#666" }}>No events yet...</div>
      </Show>
    </div>
  )
}

const kbdStyle: JSX.CSSProperties = {
  display: "inline-block",
  padding: "2px 6px",
  "font-size": "0.8rem",
  "font-family": "monospace",
  "background-color": "#f0f0f0",
  border: "1px solid #ccc",
  "border-radius": "4px",
  "box-shadow": "0 1px 0 #ccc",
}
