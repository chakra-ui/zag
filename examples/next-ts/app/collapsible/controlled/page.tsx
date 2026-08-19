"use client"

import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import "@styles/collapsible.css"

export default function Page() {
  const [open, setOpen] = useState(true)

  const service = useMachine(collapsible.machine, {
    id: useId(),
    open,
    onOpenChange: (details) => setOpen(details.open),
  })

  const api = collapsible.connect(service, normalizeProps)

  return (
    <main className="collapsible">
      <h1>Collapsible Controlled</h1>
      <h1>{String(open)}</h1>

      <div style={{ display: "flex", gap: "12px" }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      <div {...api.getRootProps()}>
        <div {...api.getContentProps()}>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. <a href="#">Some Link</a>
          </p>
        </div>
      </div>
    </main>
  )
}
