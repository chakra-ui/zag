import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { Presence } from "../../components/presence"
import styles from "../../../shared/styles/drawer.module.css"

function AlwaysOpenDrawer() {
  const service = useMachine(drawer.machine, {
    id: useId(),
    open: true,
  })

  const api = drawer.connect(service, normalizeProps)

  return (
    <div>
      <h3>Always Open (no onOpenChange)</h3>
      <p style={{ fontSize: 14, color: "#6b7280" }}>
        This drawer has <code>open: true</code> without <code>onOpenChange</code>. Swiping, escape, and outside click
        should have no effect.
      </p>
      <Presence className={styles.backdrop} {...api.getBackdropProps()} />
      <div className={styles.positioner} {...api.getPositionerProps()}>
        <Presence className={styles.content} {...api.getContentProps()}>
          <div className={styles.grabber} {...api.getGrabberProps()}>
            <div className={styles.grabberIndicator} {...api.getGrabberIndicatorProps()} />
          </div>
          <div {...api.getTitleProps()}>Always Open</div>
          <p {...api.getDescriptionProps()}>
            Try swiping down, pressing Escape, or clicking outside. This drawer should never close.
          </p>
        </Presence>
      </div>
    </div>
  )
}

function ControlledDrawer() {
  const [open, setOpen] = useState(false)

  const service = useMachine(drawer.machine, {
    id: useId(),
    open,
    onOpenChange({ open }) {
      setOpen(open)
    },
  })

  const api = drawer.connect(service, normalizeProps)

  return (
    <div>
      <h3>Controlled (open + onOpenChange)</h3>
      <p style={{ fontSize: 14, color: "#6b7280" }}>Standard controlled mode. Open state is managed by React.</p>
      <button className={styles.trigger} {...api.getTriggerProps()}>
        Open Controlled
      </button>
      <Presence className={styles.backdrop} {...api.getBackdropProps()} />
      <div className={styles.positioner} {...api.getPositionerProps()}>
        <Presence className={styles.content} {...api.getContentProps()}>
          <div className={styles.grabber} {...api.getGrabberProps()}>
            <div className={styles.grabberIndicator} {...api.getGrabberIndicatorProps()} />
          </div>
          <div {...api.getTitleProps()}>Controlled Drawer</div>
          <p {...api.getDescriptionProps()}>
            This drawer is fully controlled. Swipe, escape, and outside click all work.
          </p>
          <p style={{ fontSize: 14 }}>
            Open: <strong>{String(open)}</strong>
          </p>
          <button {...api.getCloseTriggerProps()}>Close</button>
        </Presence>
      </div>
    </div>
  )
}

export default function Page() {
  const [scenario, setScenario] = useState<"always-open" | "controlled">("controlled")

  return (
    <main style={{ padding: 20 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          className={styles.trigger}
          onClick={() => setScenario("always-open")}
          style={{ fontWeight: scenario === "always-open" ? 700 : 400 }}
        >
          Always Open
        </button>
        <button
          className={styles.trigger}
          onClick={() => setScenario("controlled")}
          style={{ fontWeight: scenario === "controlled" ? 700 : 400 }}
        >
          Controlled
        </button>
      </div>

      {scenario === "always-open" && <AlwaysOpenDrawer />}
      {scenario === "controlled" && <ControlledDrawer />}
    </main>
  )
}
