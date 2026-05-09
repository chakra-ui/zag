"use client"

import * as hoverCard from "@zag-js/hover-card"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import "@styles/hover-card.css"

export default function Page() {
  const [open, setOpen] = useState(false)

  const service = useMachine(hoverCard.machine, {
    id: useId(),
    open,
    onOpenChange: (details) => setOpen(details.open),
  })

  const api = hoverCard.connect(service, normalizeProps)

  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>HoverCard Controlled</h1>
      <h1>{String(open)}</h1>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      <main className="hover-card">
        <div style={{ display: "flex", gap: "50px" }}>
          <a href="https://twitter.com/zag_js" target="_blank" {...api.getTriggerProps()}>
            Twitter
          </a>

          {api.open && (
            <Portal>
              <div {...api.getPositionerProps()}>
                <div {...api.getContentProps()}>
                  <div {...api.getArrowProps()}>
                    <div {...api.getArrowTipProps()} />
                  </div>
                  Twitter Preview
                  <a href="https://twitter.com/zag_js" target="_blank">
                    Twitter
                  </a>
                </div>
              </div>
            </Portal>
          )}
        </div>
      </main>
    </div>
  )
}
