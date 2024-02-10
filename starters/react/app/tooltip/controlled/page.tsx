"use client"

import { Tooltip } from "@/components/tooltip"
import { useState } from "react"

export default function Page() {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Tooltip Controlled</h1>

      <h1>{String(open)}</h1>

      <div style={{ display: "flex", gap: "20px" }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>

        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>

        <Tooltip label="Tooltip Content" open={open} onOpenChange={(e) => setOpen(e.open)}>
          <button>Some tooltip</button>
        </Tooltip>
      </div>
    </div>
  )
}
