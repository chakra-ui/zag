import { registerHotkey } from "@zag-js/hotkeys"
import { callAll } from "@zag-js/utils"
import { useEffect, useState } from "react"

export default function HotkeysPage() {
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev.slice(0, 9)])
  }

  useEffect(() => {
    return callAll(
      registerHotkey("ctrl+k", () => addLog("Ctrl+K - Command palette")),
      registerHotkey("escape", () => addLog("Escape - Close modal")),
      registerHotkey("g > h", () => addLog("G then H - Go home")),
      registerHotkey("{ctrl|meta}+enter", () => addLog("Ctrl+Enter - Submit"), {
        enableOnFormTags: true,
      }),
    )
  }, [])

  return (
    <main style={{ padding: "2rem", maxWidth: "42rem", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Simple Hotkeys Example</h1>
      <pre>{JSON.stringify(logs, null, 2)}</pre>
    </main>
  )
}
