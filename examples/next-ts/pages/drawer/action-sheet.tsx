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
      <button className={styles.trigger} {...api.getTriggerProps()}>
        Manage Profile
      </button>
      <Presence className={styles.backdrop} {...api.getBackdropProps()} />
      <div className={styles.positioner} {...api.getPositionerProps()}>
        <Presence className={styles.popup} {...api.getContentProps({ draggable: false })}>
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
            <button className={styles.actionButton} {...api.getCloseTriggerProps()}>
              Cancel
            </button>
          </div>
        </Presence>
      </div>
    </main>
  )
}
