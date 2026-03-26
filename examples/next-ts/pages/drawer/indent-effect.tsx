import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine, useSyncExternalStore } from "@zag-js/react"
import { useId } from "react"
import { Presence } from "../../components/presence"
import styles from "../../../shared/styles/drawer-indent-effect.module.css"

const stack = drawer.createStack()

export default function Page() {
  const service = useMachine(drawer.machine, {
    id: useId(),
    stack,
    modal: false,
  })

  const api = drawer.connect(service, normalizeProps)
  const snapshot = useSyncExternalStore(stack.subscribe, stack.getSnapshot, stack.getSnapshot)
  const stackApi = drawer.connectStack(snapshot, normalizeProps)

  return (
    <main className={styles.page}>
      <div className={styles.sandbox}>
        <div
          {...stackApi.getIndentBackgroundProps()}
          className={styles.indentBackground}
          data-testid="drawer-indent-background"
        />

        <div {...stackApi.getIndentProps()} className={styles.indent} data-testid="drawer-indent">
          <div className={styles.center}>
            <button {...api.getTriggerProps()} className={styles.trigger}>
              Open drawer
            </button>
          </div>
        </div>

        <Presence {...api.getBackdropProps()} className={styles.backdrop} data-testid="drawer-backdrop" />
        <div {...api.getPositionerProps()} className={styles.positioner}>
          <Presence {...api.getContentProps()} className={styles.content}>
            <div {...api.getGrabberProps()} className={styles.grabber}>
              <div {...api.getGrabberIndicatorProps()} className={styles.grabberIndicator} />
            </div>
            <div className={styles.contentInner}>
              <h2 {...api.getTitleProps()} className={styles.title}>
                Notifications
              </h2>
              <p {...api.getDescriptionProps()} className={styles.description}>
                You are all caught up. Good job!
              </p>
              <div className={styles.actions}>
                <button {...api.getCloseTriggerProps()} className={styles.close}>
                  Close
                </button>
              </div>
            </div>
          </Presence>
        </div>
      </div>
    </main>
  )
}
