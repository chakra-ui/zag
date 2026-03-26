import styles from "../../../../shared/src/css/dialog.module.css"
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
        <Presence {...api.getBackdropProps()} className={styles.Backdrop} />
        <div {...api.getPositionerProps()} className={styles.Positioner}>
          <Presence {...api.getContentProps()} className={styles.Content}>
            <h2 {...api.getTitleProps()} className={styles.Title}>Edit profile</h2>
            <p {...api.getDescriptionProps()} className={styles.Description}>Make changes to your profile here. Click save when you are done.</p>
            <button
              onClick={() => {
                setTimeout(() => {
                  api.setOpen(false)
                }, 2000)
              }}
            >
              Delayed close
            </button>
            <button {...api.getCloseTriggerProps()} className={styles.CloseTrigger}>Close</button>
          </Presence>
        </div>
      </Portal>
    </main>
  )
}
