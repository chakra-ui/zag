import * as dialog from "@zag-js/dialog"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useState } from "react"
import { Presence } from "../../components/presence"

export default function Dialog() {
  const [open, setOpen] = useState(false)

  const service = useMachine(dialog.machine, {
    id: "1",
    open,
    onOpenChange(details) {
      setOpen(details.open)
    },
  })

  const api = dialog.connect(service, normalizeProps)

  return (
    <main>
      <button onClick={() => setOpen(!open)}>Delayed open</button>
      <p>state - isOpen: {String(open)}</p>
      <p>machine - isOpen: {String(api.open)}</p>
      <Portal>
        <Presence {...api.getBackdropProps()} />
        <div {...api.getPositionerProps()}>
          <Presence {...api.getContentProps()}>
            <h2 {...api.getTitleProps()}>Edit profile</h2>
            <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
            <button
              onClick={() => {
                setTimeout(() => {
                  api.setOpen(false)
                }, 2000)
              }}
            >
              Delayed close
            </button>
            <button {...api.getCloseTriggerProps()}>Close</button>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
