"use client"

import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { useId, useState } from "react"
import "@styles/tooltip.css"

export default function Page() {
  const [open, setOpen] = useState(false)

  const service = useMachine(tooltip.machine, {
    id: useId(),
    open,
    onOpenChange: (details) => setOpen(details.open),
  })

  const api = tooltip.connect(service, normalizeProps)

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

        <button {...api.getTriggerProps()}>Some tooltip</button>
        {api.open && (
          <Portal>
            <div {...api.getPositionerProps()}>
              <div {...api.getContentProps()}>Tooltip Content</div>
            </div>
          </Portal>
        )}
      </div>
    </div>
  )
}
