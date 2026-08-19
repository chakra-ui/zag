import { createHotkeyStore } from "@zag-js/hotkeys"
import { useEffect, useState } from "react"

const store = createHotkeyStore()

export default function SequencesPage() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)])
  }

  useEffect(() => {
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

    return () => store.destroy()
  }, [])

  return (
    <main style={{ padding: "2rem", maxWidth: "42rem", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" }}>Key Sequences</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Press keys in sequence (vim-style). Type the first key, then the second within 1 second.
      </p>

      <div style={{ marginBottom: "1.5rem", padding: "1rem", backgroundColor: "#f5f5f5", borderRadius: "0.5rem" }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>Navigation</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          <Kbd>G H</Kbd> Home
          <Kbd>G I</Kbd> Issues
          <Kbd>G P</Kbd> Pull Requests
          <Kbd>G S</Kbd> Settings
        </div>

        <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>Toggle</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          <Kbd>K T</Kbd> Theme
          <Kbd>K S</Kbd> Sidebar
        </div>

        <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>With Modifiers</div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Kbd>Ctrl+K D</Kbd> Debug Panel
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
        {logs.length === 0 && <div style={{ color: "#666", fontStyle: "italic" }}>Press a key sequence...</div>}
      </div>
    </main>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        padding: "2px 6px",
        fontSize: "0.8rem",
        fontFamily: "monospace",
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: "4px",
        boxShadow: "0 1px 0 #eee",
        marginRight: "4px",
      }}
    >
      {children}
    </code>
  )
}
