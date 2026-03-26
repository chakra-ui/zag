import styles from "../../../../shared/src/css/dialog.module.css"
import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"

export default function Dialog() {
  const service = useMachine(dialog.machine, { id: "1" })
  const api = dialog.connect(service, normalizeProps)

  return (
    <main>
      <button {...api.getTriggerProps()}> Click me</button>
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
    </main>
  )
}
