import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { MoreVerticalIcon } from "lucide-react"
import { useId, useState } from "react"
import { Presence } from "../components/presence"

interface Document {
  id: number
  name: string
  type: string
  size: string
  modified: string
}

const documents: Document[] = [
  { id: 1, name: "Project Proposal.pdf", type: "PDF", size: "2.4 MB", modified: "2024-01-15" },
  { id: 2, name: "Budget 2024.xlsx", type: "Excel", size: "856 KB", modified: "2024-01-14" },
  { id: 3, name: "Meeting Notes.docx", type: "Word", size: "124 KB", modified: "2024-01-13" },
  { id: 4, name: "Design Mockups.fig", type: "Figma", size: "4.2 MB", modified: "2024-01-12" },
  { id: 5, name: "Code Review.md", type: "Markdown", size: "45 KB", modified: "2024-01-11" },
]

export default function MenuMultipleTrigger() {
  const [activeDocument, setActiveDocument] = useState<Document | null>(null)

  const service = useMachine(menu.machine, {
    id: useId(),
    onTriggerValueChange({ value }) {
      const doc = documents.find((d) => `${d.id}` === value) ?? null
      setActiveDocument(doc)
    },
  })

  const api = menu.connect(service, normalizeProps)

  return (
    <main>
      <section style={{ marginBottom: "40px" }}>
        <h2>Document Manager</h2>

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6", textAlign: "left" }}>
              <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Name</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Type</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Size</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Modified</th>
              <th style={{ padding: "12px", borderBottom: "2px solid #e5e7eb" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={{ padding: "12px" }}>{doc.name}</td>
                <td style={{ padding: "12px" }}>{doc.type}</td>
                <td style={{ padding: "12px" }}>{doc.size}</td>
                <td style={{ padding: "12px" }}>{doc.modified}</td>
                <td style={{ padding: "12px" }}>
                  <button {...api.getTriggerProps({ value: `${doc.id}` })}>
                    <MoreVerticalIcon size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "20px", padding: "12px", backgroundColor: "#f9fafb", borderRadius: "6px" }}>
          <strong>Active Trigger:</strong> {api.triggerValue || "-"} <br />
          <strong>Active Document:</strong> {activeDocument ? `${activeDocument.name} (${activeDocument.type})` : "-"}
        </div>
      </section>

      <Portal>
        <div {...api.getPositionerProps()}>
          <Presence {...api.getContentProps()}>
            <div {...api.getItemProps({ value: "rename" })}>Rename (value: {api.triggerValue})</div>
            <div {...api.getItemProps({ value: "delete" })}>Delete (value: {api.triggerValue})</div>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
