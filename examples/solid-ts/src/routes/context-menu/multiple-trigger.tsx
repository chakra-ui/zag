import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/menu.css"

interface FileItem {
  id: number
  name: string
  type: "folder" | "file"
  icon: string
}

const files: FileItem[] = [
  { id: 1, name: "Documents", type: "folder", icon: "📁" },
  { id: 2, name: "Photos", type: "folder", icon: "📁" },
  { id: 3, name: "report.pdf", type: "file", icon: "📄" },
  { id: 4, name: "presentation.pptx", type: "file", icon: "📊" },
  { id: 5, name: "notes.txt", type: "file", icon: "📝" },
  { id: 6, name: "Downloads", type: "folder", icon: "📁" },
]

const itemStyle = { padding: "8px 12px", cursor: "pointer", "border-radius": "4px" }

export default function Page() {
  const [activeFile, setActiveFile] = createSignal<FileItem | null>(null)

  const service = useMachine(menu.machine, {
    id: createUniqueId(),
    onTriggerValueChange({ value }) {
      const file = files.find((f) => `${f.id}` === value) ?? null
      setActiveFile(file)
    },
    onSelect({ value }) {
      const file = activeFile()
      if (file) {
        console.log(`Action: ${value} on ${file.name}`)
      }
    },
  })

  const api = createMemo(() => menu.connect(service, normalizeProps))

  return (
    <>
      <main style={{ padding: "40px", "font-family": "system-ui" }}>
        <h2>File Explorer - Right-click on any item</h2>
        <p style={{ color: "#666", "margin-bottom": "20px" }}>
          Right-click on different files/folders to open the context menu. The menu will reposition to the click
          location.
        </p>

        <div
          style={{
            display: "grid",
            "grid-template-columns": "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "16px",
            padding: "20px",
            "background-color": "#f9fafb",
            "border-radius": "8px",
          }}
        >
          <For each={files}>
            {(file) => (
              <div
                {...api().getContextTriggerProps({ value: `${file.id}` })}
                style={{
                  display: "flex",
                  "flex-direction": "column",
                  "align-items": "center",
                  padding: "16px",
                  "background-color": "white",
                  "border-radius": "8px",
                  border: "1px solid #e5e7eb",
                  cursor: "context-menu",
                  "user-select": "none",
                  transition: "box-shadow 0.2s",
                }}
              >
                <span style={{ "font-size": "32px", "margin-bottom": "8px" }}>{file.icon}</span>
                <span style={{ "font-size": "14px", "text-align": "center", "word-break": "break-word" }}>
                  {file.name}
                </span>
              </div>
            )}
          </For>
        </div>

        <div style={{ "margin-top": "20px", padding: "12px", "background-color": "#f9fafb", "border-radius": "6px" }}>
          <strong>Active Trigger:</strong> {api().triggerValue || "-"} <br />
          <strong>Active File:</strong>{" "}
          {activeFile() ? `${activeFile()!.icon} ${activeFile()!.name} (${activeFile()!.type})` : "-"}
        </div>

        <Portal>
          <div {...api().getPositionerProps()}>
            <ul
              {...api().getContentProps()}
              style={{
                "list-style": "none",
                margin: 0,
                padding: "4px",
                "background-color": "white",
                border: "1px solid #e5e7eb",
                "border-radius": "8px",
                "box-shadow": "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                "min-width": "160px",
              }}
            >
              <li {...api().getItemProps({ value: "open" })} style={itemStyle}>
                Open {activeFile()?.type === "folder" ? "Folder" : "File"}
              </li>
              <li {...api().getItemProps({ value: "rename" })} style={itemStyle}>
                Rename
              </li>
              <li {...api().getItemProps({ value: "copy" })} style={itemStyle}>
                Copy
              </li>
              <li {...api().getItemProps({ value: "cut" })} style={itemStyle}>
                Cut
              </li>
              <li style={{ height: "1px", "background-color": "#e5e7eb", margin: "4px 0" }} />
              <li {...api().getItemProps({ value: "delete" })} style={{ ...itemStyle, color: "#dc2626" }}>
                Delete
              </li>
            </ul>
          </div>
        </Portal>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["triggerValue", "anchorPoint"]} />
      </Toolbar>
    </>
  )
}
