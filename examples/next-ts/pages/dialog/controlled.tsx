import styles from "../../../../shared/src/css/dialog.module.css"
import * as dialog from "@zag-js/dialog"
import { useMachine, normalizeProps, Portal } from "@zag-js/react"
import React, { useState } from "react"

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
    <div>
      <button onClick={() => setOpen(!open)}>Open Dialog</button>
      <p>state - isOpen: {String(open)}</p>
      <p>machine - isOpen: {String(api.open)}</p>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} className={styles.Backdrop} />
          <div {...api.getPositionerProps()} className={styles.Positioner}>
            <div {...api.getContentProps()} className={styles.Content}>
              <h2 {...api.getTitleProps()} className={styles.Title}>Edit profile</h2>
              <p {...api.getDescriptionProps()} className={styles.Description}>Make changes to your profile here. Click save when you are done.</p>
              <div>
                <input placeholder="Enter name..." />
                <button>Save</button>
              </div>
              <button {...api.getCloseTriggerProps()} className={styles.CloseTrigger}>Close</button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  )
}
