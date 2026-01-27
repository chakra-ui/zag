import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

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

export default function ContextMenuMultipleTrigger() {
  const [activeFile, setActiveFile] = useState<FileItem | null>(null)

  const service = useMachine(menu.machine, {
    id: useId(),
    onTriggerValueChange({ value }) {
      const file = files.find((f) => `${f.id}` === value) ?? null
      setActiveFile(file)
    },
    onSelect({ value }) {
      if (activeFile) {
        console.log(`Action: ${value} on ${activeFile.name}`)
      }
    },
  })

  const api = menu.connect(service, normalizeProps)

  return (
    <>
      <main style={{ padding: "40px", fontFamily: "system-ui" }}>
        <h2>File Explorer - Right-click on any item</h2>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Right-click on different files/folders to open the context menu. The menu will reposition to the click
          location.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: "16px",
            padding: "20px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
          }}
        >
          {files.map((file) => (
            <div
              key={file.id}
              {...api.getContextTriggerProps({ value: `${file.id}` })}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "16px",
                backgroundColor: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                cursor: "context-menu",
                userSelect: "none",
                transition: "box-shadow 0.2s",
              }}
            >
              <span style={{ fontSize: "32px", marginBottom: "8px" }}>{file.icon}</span>
              <span style={{ fontSize: "14px", textAlign: "center", wordBreak: "break-word" }}>{file.name}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
          <strong>Active Trigger:</strong> {api.triggerValue || "-"} <br />
          <strong>Active File:</strong>{" "}
          {activeFile ? `${activeFile.icon} ${activeFile.name} (${activeFile.type})` : "-"}
        </div>

        <Portal>
          <div {...api.getPositionerProps()}>
            <ul
              {...api.getContentProps()}
              style={{
                listStyle: "none",
                margin: 0,
                padding: "4px",
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                minWidth: "160px",
              }}
            >
              <li
                {...api.getItemProps({ value: "open" })}
                style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "4px" }}
              >
                Open {activeFile?.type === "folder" ? "Folder" : "File"}
              </li>
              <li
                {...api.getItemProps({ value: "rename" })}
                style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "4px" }}
              >
                Rename
              </li>
              <li
                {...api.getItemProps({ value: "copy" })}
                style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "4px" }}
              >
                Copy
              </li>
              <li
                {...api.getItemProps({ value: "cut" })}
                style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "4px" }}
              >
                Cut
              </li>
              <li
                style={{
                  height: "1px",
                  backgroundColor: "#e5e7eb",
                  margin: "4px 0",
                }}
              />
              <li
                {...api.getItemProps({ value: "delete" })}
                style={{ padding: "8px 12px", cursor: "pointer", borderRadius: "4px", color: "#dc2626" }}
              >
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
