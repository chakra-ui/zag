import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { Presence } from "../../components/presence"
import styles from "../../../shared/styles/drawer-action-sheet.module.css"

export default function Page() {
  const service = useMachine(drawer.machine, {
    id: useId(),
  })

  const api = drawer.connect(service, normalizeProps)

  return (
    <main>
      <button {...api.getTriggerProps()} className={styles.trigger}>
        Manage Profile
      </button>
      <Presence {...api.getBackdropProps()} className={styles.backdrop} />
      <div {...api.getPositionerProps()} className={styles.positioner}>
        <Presence {...api.getContentProps({ draggable: false })} className={styles.popup}>
          <div className={styles.surface}>
            <div {...api.getTitleProps()} className={styles.title}>
              Profile Actions
            </div>
            <ul className={styles.actions}>
              <li className={styles.action}>
                <button className={styles.actionButton} onClick={() => api.setOpen(false)}>
                  Edit Profile
                </button>
              </li>
              <li className={styles.action}>
                <button className={styles.actionButton} onClick={() => api.setOpen(false)}>
                  Change Avatar
                </button>
              </li>
              <li className={styles.action}>
                <button className={styles.actionButton} onClick={() => api.setOpen(false)}>
                  Privacy Settings
                </button>
              </li>
            </ul>
          </div>

          <div className={styles.dangerSurface}>
            <button className={styles.dangerButton} onClick={() => api.setOpen(false)}>
              Delete Account
            </button>
          </div>

          <div className={styles.surface}>
            <button {...api.getCloseTriggerProps()} className={styles.actionButton}>
              Cancel
            </button>
          </div>
        </Presence>
      </div>
    </main>
  )
}
