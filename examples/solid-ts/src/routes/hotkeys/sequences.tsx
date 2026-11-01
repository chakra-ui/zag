import { createHotkeyStore } from "@zag-js/hotkeys"
import { createSignal, Index, onCleanup, onMount, Show, type JSX } from "solid-js"

const store = createHotkeyStore()

export default function Page() {
  const [logs, setLogs] = createSignal<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)])
  }

  onMount(() => {
    store.register([
      { id: "go-home", hotkey: "G > H", label: "Go Home", action: () => addLog("G then H: Navigate home") },
      { id: "go-issues", hotkey: "G > I", label: "Go Issues", action: () => addLog("G then I: Navigate to issues") },
      { id: "go-pulls", hotkey: "G > P", label: "Go PRs", action: () => addLog("G then P: Navigate to pull requests") },
      {
        id: "go-settings",
        hotkey: "G > S",
        label: "Go Settings",
        action: () => addLog("G then S: Navigate to settings"),
      },
      { id: "toggle-theme", hotkey: "K > T", label: "Toggle Theme", action: () => addLog("K then T: Toggle theme") },
      {
        id: "toggle-sidebar",
        hotkey: "K > S",
        label: "Toggle Sidebar",
        action: () => addLog("K then S: Toggle sidebar"),
      },
      {
        id: "mod-sequence",
        hotkey: "Ctrl+K > D",
        label: "Debug",
        action: () => addLog("Ctrl+K then D: Open debug panel"),
      },
    ])

    store.init({ target: document })
  })

  onCleanup(() => store.destroy())

  return (
    <main style={{ padding: "2rem", "max-width": "42rem", margin: "0 auto" }}>
      <h1 style={{ "font-size": "1.5rem", "font-weight": "bold", "margin-bottom": "0.5rem" }}>Key Sequences</h1>
      <p style={{ color: "#666", "margin-bottom": "1.5rem" }}>
        Press keys in sequence (vim-style). Type the first key, then the second within 1 second.
      </p>

      <div
        style={{ "margin-bottom": "1.5rem", padding: "1rem", "background-color": "#f5f5f5", "border-radius": "0.5rem" }}
      >
        <div style={{ "font-size": "0.85rem", "font-weight": 600, "margin-bottom": "8px" }}>Navigation</div>
        <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap", "margin-bottom": "12px" }}>
          <Kbd>G H</Kbd> Home
          <Kbd>G I</Kbd> Issues
          <Kbd>G P</Kbd> Pull Requests
          <Kbd>G S</Kbd> Settings
        </div>

        <div style={{ "font-size": "0.85rem", "font-weight": 600, "margin-bottom": "8px" }}>Toggle</div>
        <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap", "margin-bottom": "12px" }}>
          <Kbd>K T</Kbd> Theme
          <Kbd>K S</Kbd> Sidebar
        </div>

        <div style={{ "font-size": "0.85rem", "font-weight": 600, "margin-bottom": "8px" }}>With Modifiers</div>
        <div style={{ display: "flex", gap: "8px", "flex-wrap": "wrap" }}>
          <Kbd>Ctrl+K D</Kbd> Debug Panel
        </div>
      </div>

      <div
        style={{
          "background-color": "#000",
          color: "#00ff00",
          padding: "1rem",
          "border-radius": "0.5rem",
          "font-family": "monospace",
        }}
      >
        <div style={{ "margin-bottom": "0.5rem", color: "#888" }}>Event Log:</div>
        <Index each={logs()}>{(log) => <div style={{ "font-size": "0.8rem" }}>{log()}</div>}</Index>
        <Show when={logs().length === 0}>
          <div style={{ color: "#666", "font-style": "italic" }}>Press a key sequence...</div>
        </Show>
      </div>
    </main>
  )
}

function Kbd(props: { children: JSX.Element }) {
  return (
    <code
      style={{
        padding: "2px 6px",
        "font-size": "0.8rem",
        "font-family": "monospace",
        "background-color": "#fff",
        border: "1px solid #ddd",
        "border-radius": "4px",
        "box-shadow": "0 1px 0 #eee",
        "margin-right": "4px",
      }}
    >
      {props.children}
    </code>
  )
}
