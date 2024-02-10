"use client"

import { Menu } from "@/components/menu"
import { useState } from "react"

export default function Page() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Menu Controlled</h1>
      <h1>{String(open)}</h1>

      <div style={{ display: "flex", gap: "40px", marginBottom: "24px" }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      <Menu
        open={open}
        onOpenChange={({ open }) => setOpen(open)}
        items={[
          { label: "Edit", value: "edit" },
          { label: "Duplicate", value: "duplicate" },
          { label: "Delete", value: "delete" },
          { label: "Export...", value: "export" },
        ]}
      >
        <button type="button">Menu Trigger</button>
      </Menu>
    </div>
  )
}
