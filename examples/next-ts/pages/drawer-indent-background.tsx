import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useSyncExternalStore } from "react"
import { Presence } from "../components/presence"
import styles from "../../shared/styles/drawer-indent.module.css"

const stack = drawer.createStack()

export default function Page() {
  const service = useMachine(drawer.machine, { id: useId(), stack })

  const api = drawer.connect(service, normalizeProps)
  const snapshot = useSyncExternalStore(stack.subscribe, stack.getSnapshot, stack.getSnapshot)
  const stackApi = drawer.connectStack(snapshot, normalizeProps)

  return (
    <main className={styles.main}>
      <div
        {...stackApi.getIndentBackgroundProps()}
        className={styles.indentBackground}
        data-testid="drawer-indent-background"
      />

      <div {...stackApi.getIndentProps()} className={styles.indent} data-testid="drawer-indent">
        <h2 className={styles.heading}>Drawer Indent Background</h2>
        <p className={styles.description}>
          Open and drag the drawer. The background and app shell use stack snapshot props so styles stay coordinated.
        </p>
        <button {...api.getTriggerProps()} className={styles.button}>
          Open Drawer
        </button>
      </div>

      <Presence {...api.getBackdropProps()} className={styles.backdrop} />
      <div {...api.getPositionerProps()} className={styles.positioner}>
        <Presence {...api.getContentProps()} className={styles.content}>
          <div {...api.getGrabberProps()} className={styles.grabber}>
            <div {...api.getGrabberIndicatorProps()} className={styles.grabberIndicator} />
          </div>
          <div {...api.getTitleProps()} className={styles.title}>
            Drawer
          </div>
          <div className={styles.scrollable}>
            {Array.from({ length: 30 }).map((_element, index) => (
              <div key={index}>Item {index + 1}</div>
            ))}
          </div>
        </Presence>
      </div>
    </main>
  )
}
