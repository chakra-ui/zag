import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { Presence } from "../../components/presence"
import styles from "../../../../shared/styles/drawer-action-sheet.module.css"

export default function Page() {
  const service = useMachine(drawer.machine, () => ({
    id: createUniqueId(),
  }))

  const api = createMemo(() => drawer.connect(service, normalizeProps))

  return (
    <main>
      <button class={styles.trigger} {...api().getTriggerProps()}>
        Manage Profile
      </button>
      <Presence class={styles.backdrop} {...api().getBackdropProps()} />
      <div class={styles.positioner} {...api().getPositionerProps()}>
        <Presence class={styles.popup} {...api().getContentProps({ draggable: false })}>
          <div class={styles.surface}>
            <div {...api().getTitleProps()} class={styles.title}>
              Profile Actions
            </div>
            <ul class={styles.actions}>
              <li class={styles.action}>
                <button type="button" class={styles.actionButton} onClick={() => api().setOpen(false)}>
                  Edit Profile
                </button>
              </li>
              <li class={styles.action}>
                <button type="button" class={styles.actionButton} onClick={() => api().setOpen(false)}>
                  Change Avatar
                </button>
              </li>
              <li class={styles.action}>
                <button type="button" class={styles.actionButton} onClick={() => api().setOpen(false)}>
                  Privacy Settings
                </button>
              </li>
            </ul>
          </div>

          <div class={styles.dangerSurface}>
            <button type="button" class={styles.dangerButton} onClick={() => api().setOpen(false)}>
              Delete Account
            </button>
          </div>

          <div class={styles.surface}>
            <button type="button" class={styles.actionButton} {...api().getCloseTriggerProps()}>
              Cancel
            </button>
          </div>
        </Presence>
      </div>
    </main>
  )
}
