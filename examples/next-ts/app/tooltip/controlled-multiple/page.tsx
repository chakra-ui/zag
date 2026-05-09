"use client"

import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { useId, useState } from "react"
import "@styles/tooltip.css"

const TooltipDemo = () => {
  const [open, setOpen] = useState(false)

  const service = useMachine(tooltip.machine, {
    id: useId(),
    open,
    onOpenChange: (details) => setOpen(details.open),
    positioning: { placement: "right" },
  })

  const api = tooltip.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>Some tooltip</button>
      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>Tooltip Content</div>
          </div>
        </Portal>
      )}
    </>
  )
}

export default function Page() {
  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Tooltip Controlled (Multiple)</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {Array.from({ length: 10 }).map((_, index) => (
          <TooltipDemo key={index} />
        ))}
      </div>
    </div>
  )
}
