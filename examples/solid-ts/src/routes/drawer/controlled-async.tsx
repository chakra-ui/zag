import styles from "@styles/drawer.module.css"
import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { Presence } from "~/components/presence"

export default function Page() {
  const [open, setOpen] = createSignal(true)

  const id = createUniqueId()
  const service = useMachine(drawer.machine, () => ({
    id,
    open: open(),
    onOpenChange({ open }) {
      // Simulate an async setter (history API, transitions, etc.)
      setTimeout(() => setOpen(open), 1000)
    },
  }))

  const api = createMemo(() => drawer.connect(service, normalizeProps))

  return (
    <main style={{ padding: "20px" }}>
      <h3>Controlled (async/delayed setter)</h3>
      <p style={{ "font-size": "14px", color: "#6b7280" }}>
        The <code>open</code> setter is delayed by 80ms to mimic an async source of truth.
      </p>
      <button class={styles.trigger} {...api().getTriggerProps()}>
        Toggle Drawer
      </button>
      <Presence class={styles.backdrop} {...api().getBackdropProps()} />
      <div class={styles.positioner} {...api().getPositionerProps()}>
        <Presence class={styles.content} {...api().getContentProps()}>
          <div class={styles.grabber} {...api().getGrabberProps()}>
            <div class={styles.grabberIndicator} {...api().getGrabberIndicatorProps()} />
          </div>
          <div {...api().getTitleProps()}>Controlled Drawer (async)</div>
          <p {...api().getDescriptionProps()}>Swipe down to close or click the backdrop. Watch for flicker.</p>
          <p style={{ "font-size": "14px" }}>
            Open: <strong>{String(open())}</strong>
          </p>
          <button {...api().getCloseTriggerProps()}>
            <XIcon />
          </button>
        </Presence>
      </div>
    </main>
  )
}
