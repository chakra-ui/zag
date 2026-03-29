import * as dialog from "@zag-js/dialog"
import { createHotkeyStore } from "@zag-js/hotkeys"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useEffect, useRef, useState } from "react"
import { Presence } from "../../components/presence"

let openDialog: () => void = () => {}

const store = createHotkeyStore()

store.register([
  {
    id: "open-command-dialog",
    hotkey: "mod+K",
    label: "Open Command Dialog",
    description: "Open the command dialog",
    action: () => openDialog(),
    options: { preventDefault: true },
  },
  {
    id: "open-command-dialog-slash",
    hotkey: "mod+/",
    label: "Open Command Dialog (slash)",
    description: "Open the command dialog with slash",
    action: () => openDialog(),
    options: { preventDefault: true },
  },
])

const commands = [
  { id: "new-file", label: "New File", category: "File" },
  { id: "open-file", label: "Open File", category: "File" },
  { id: "save-file", label: "Save File", category: "File" },
  { id: "toggle-sidebar", label: "Toggle Sidebar", category: "View" },
  { id: "toggle-terminal", label: "Toggle Terminal", category: "View" },
  { id: "zoom-in", label: "Zoom In", category: "View" },
  { id: "zoom-out", label: "Zoom Out", category: "View" },
  { id: "find-replace", label: "Find and Replace", category: "Edit" },
  { id: "format-document", label: "Format Document", category: "Edit" },
  { id: "go-to-line", label: "Go to Line", category: "Edit" },
  { id: "git-commit", label: "Git: Commit", category: "Git" },
  { id: "git-push", label: "Git: Push", category: "Git" },
  { id: "git-pull", label: "Git: Pull", category: "Git" },
]

export default function CommandDialogPage() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const service = useMachine(dialog.machine, {
    id: "command-dialog",
    open,
    onOpenChange(details) {
      setOpen(details.open)
    },
  })
  const api = dialog.connect(service, normalizeProps)

  const filtered = commands.filter((cmd) => cmd.label.toLowerCase().includes(query.toLowerCase()))

  const grouped = filtered.reduce(
    (acc, cmd) => {
      ;(acc[cmd.category] ??= []).push(cmd)
      return acc
    },
    {} as Record<string, typeof commands>,
  )

  useEffect(() => {
    openDialog = () => setOpen(true)

    store.init({
      target: document,
    })

    return () => {
      store.destroy()
    }
  }, [])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      setQuery("")
    }
  }, [open])

  return (
    <main style={{ padding: "2rem", maxWidth: "42rem", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Command Dialog</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Press <kbd style={kbdStyle}>⌘K</kbd> or <kbd style={kbdStyle}>⌘/</kbd> to open.
      </p>

      <Portal>
        <Presence {...api.getBackdropProps()} />
        <div {...api.getPositionerProps()}>
          <Presence {...api.getContentProps()}>
            <h2 {...api.getTitleProps()} style={{ display: "none" }}>
              Command Palette
            </h2>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command..."
              style={inputStyle}
            />

            <div style={listStyle}>
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <div style={categoryStyle}>{category}</div>
                  {items.map((cmd) => (
                    <div
                      key={cmd.id}
                      style={itemStyle}
                      onClick={() => {
                        setOpen(false)
                        console.log(`Executed: ${cmd.label}`)
                      }}
                    >
                      {cmd.label}
                    </div>
                  ))}
                </div>
              ))}

              {filtered.length === 0 && <div style={emptyStyle}>No results found.</div>}
            </div>
          </Presence>
        </div>
      </Portal>
    </main>
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  fontSize: "1rem",
  border: "none",
  borderBottom: "1px solid #eee",
  outline: "none",
  boxSizing: "border-box",
}

const listStyle: React.CSSProperties = {
  maxHeight: "320px",
  overflowY: "auto",
  padding: "8px 0",
}

const categoryStyle: React.CSSProperties = {
  padding: "8px 16px 4px",
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#999",
}

const itemStyle: React.CSSProperties = {
  padding: "8px 16px",
  fontSize: "0.9rem",
  cursor: "pointer",
  color: "#333",
}

const emptyStyle: React.CSSProperties = {
  padding: "24px 16px",
  textAlign: "center",
  color: "#999",
  fontSize: "0.9rem",
}
