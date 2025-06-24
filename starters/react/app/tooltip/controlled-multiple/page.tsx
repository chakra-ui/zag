"use client"

import { Tooltip } from "@/components/tooltip"
import { useState } from "react"

const TooltipDemo = () => {
  const [open, setOpen] = useState(false)
  return (
    <Tooltip
      label="Tooltip Content"
      positioning={{ placement: "right" }}
      open={open}
      onOpenChange={(e) => setOpen(e.open)}
    >
      <button>Some tooltip</button>
    </Tooltip>
  )
}

export default function Page() {
  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Tooltip Controlled (Multiple)</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {[...Array.from({ length: 10 })].map((_, index) => (
          <TooltipDemo key={index} />
        ))}
      </div>
    </div>
  )
}
