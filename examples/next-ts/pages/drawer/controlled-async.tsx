import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { Presence } from "@/components/presence"
import styles from "@styles/drawer.module.css"

export default function Page() {
  const [open, setOpen] = useState(true)

  const service = useMachine(drawer.machine, {
    id: useId(),
    open,
    onOpenChange({ open }) {
      // Simulate an async setter (history API, transitions, etc.)
      setTimeout(() => setOpen(open), 1000)
    },
  })

  const api = drawer.connect(service, normalizeProps)

  return (
    <main style={{ padding: 20 }}>
      <h3>Controlled (async/delayed setter)</h3>
      <p style={{ fontSize: 14, color: "#6b7280" }}>
        The <code>open</code> setter is delayed by 80ms to mimic an async source of truth.
      </p>
      <button className={styles.trigger} {...api.getTriggerProps()}>
        Toggle Drawer
      </button>
      <Presence className={styles.backdrop} {...api.getBackdropProps()} />
      <div className={styles.positioner} {...api.getPositionerProps()}>
        <Presence className={styles.content} {...api.getContentProps()}>
          <div className={styles.grabber} {...api.getGrabberProps()}>
            <div className={styles.grabberIndicator} {...api.getGrabberIndicatorProps()} />
          </div>
          <div {...api.getTitleProps()}>Controlled Drawer (async)</div>
          <p {...api.getDescriptionProps()}>Swipe down to close or click the backdrop. Watch for flicker.</p>
          <p style={{ fontSize: 14 }}>
            Open: <strong>{String(open)}</strong>
          </p>
          <button {...api.getCloseTriggerProps()}>Close</button>
        </Presence>
      </div>
    </main>
  )
}
