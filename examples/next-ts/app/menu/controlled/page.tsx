"use client"

import * as menu from "@zag-js/menu"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import "@styles/menu.css"

const items = [
  { label: "Edit", value: "edit" },
  { label: "Duplicate", value: "duplicate" },
  { label: "Delete", value: "delete" },
  { label: "Export...", value: "export" },
]

export default function Page() {
  const [open, setOpen] = useState(false)

  const service = useMachine(menu.machine, {
    id: useId(),
    open,
    onOpenChange: (details) => setOpen(details.open),
  })

  const api = menu.connect(service, normalizeProps)

  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Menu Controlled</h1>
      <h1>{String(open)}</h1>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      <button type="button" {...api.getTriggerProps()}>
        Menu Trigger
      </button>
      <Portal>
        <div {...api.getPositionerProps()}>
          <ul {...api.getContentProps()}>
            {items.map((item) => (
              <li key={item.value} {...api.getItemProps({ value: item.value })}>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </Portal>
    </div>
  )
}
