"use client"

import { useId, useState } from "react"
import * as popover from "@zag-js/popover"
import { useMachine, normalizeProps, Portal } from "@zag-js/react"
import "@styles/popover.css"

export default function Page() {
  const [open, setOpen] = useState(false)

  const service = useMachine(popover.machine, {
    id: useId(),
    onOpenChange: (details) => setOpen(details.open),
    open: open,
  })

  const api = popover.connect(service, normalizeProps)

  return (
    <main>
      <button {...api.getTriggerProps()}>Click me</button>
      <Portal>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getTitleProps()}>Presenters</div>
            <div {...api.getDescriptionProps()}>Description</div>
            <button onClick={() => setOpen(false)}>Action Button</button>
          </div>
        </div>
      </Portal>
    </main>
  )
}
