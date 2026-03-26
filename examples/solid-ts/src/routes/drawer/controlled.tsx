import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import { Presence } from "../../components/presence"
import styles from "../../../../shared/styles/drawer.module.css"

function AlwaysOpenDrawer() {
  const id = createUniqueId()
  const service = useMachine(drawer.machine, () => ({
    id,
    open: true,
  }))
  const api = createMemo(() => drawer.connect(service, normalizeProps))

  return (
    <div>
      <h3>Always Open (no onOpenChange)</h3>
      <p style={{ "font-size": "14px", color: "#6b7280" }}>
        This drawer has <code>open: true</code> without <code>onOpenChange</code>. Swiping, escape, and outside click
        should have no effect.
      </p>
      <Presence {...api().getBackdropProps()} class={styles.backdrop} />
      <div {...api().getPositionerProps()} class={styles.positioner}>
        <Presence {...api().getContentProps()} class={styles.content}>
          <div {...api().getGrabberProps()} class={styles.grabber}>
            <div {...api().getGrabberIndicatorProps()} class={styles.grabberIndicator} />
          </div>
          <div {...api().getTitleProps()}>Always Open</div>
          <p {...api().getDescriptionProps()}>
            Try swiping down, pressing Escape, or clicking outside. This drawer should never close.
          </p>
        </Presence>
      </div>
    </div>
  )
}

function ControlledDrawer() {
  const id = createUniqueId()
  const [open, setOpen] = createSignal(false)
  const service = useMachine(drawer.machine, () => ({
    id,
    open: open(),
    onOpenChange({ open: next }) {
      setOpen(next)
    },
  }))
  const api = createMemo(() => drawer.connect(service, normalizeProps))

  return (
    <div>
      <h3>Controlled (open + onOpenChange)</h3>
      <p style={{ "font-size": "14px", color: "#6b7280" }}>Standard controlled mode. Open state is managed by Solid.</p>
      <button {...api().getTriggerProps()} class={styles.trigger}>
        Open Controlled
      </button>
      <Presence {...api().getBackdropProps()} class={styles.backdrop} />
      <div {...api().getPositionerProps()} class={styles.positioner}>
        <Presence {...api().getContentProps()} class={styles.content}>
          <div {...api().getGrabberProps()} class={styles.grabber}>
            <div {...api().getGrabberIndicatorProps()} class={styles.grabberIndicator} />
          </div>
          <div {...api().getTitleProps()}>Controlled Drawer</div>
          <p {...api().getDescriptionProps()}>
            This drawer is fully controlled. Swipe, escape, and outside click all work.
          </p>
          <p style={{ "font-size": "14px" }}>
            Open: <strong>{String(open())}</strong>
          </p>
          <button {...api().getCloseTriggerProps()}>Close</button>
        </Presence>
      </div>
    </div>
  )
}

export default function Page() {
  const [scenario, setScenario] = createSignal<"always-open" | "controlled">("controlled")

  return (
    <main style={{ padding: "20px" }}>
      <div style={{ display: "flex", gap: "8px", "margin-bottom": "20px" }}>
        <button
          class={styles.trigger}
          type="button"
          onClick={() => setScenario("always-open")}
          style={{ "font-weight": scenario() === "always-open" ? 700 : 400 }}
        >
          Always Open
        </button>
        <button
          class={styles.trigger}
          type="button"
          onClick={() => setScenario("controlled")}
          style={{ "font-weight": scenario() === "controlled" ? 700 : 400 }}
        >
          Controlled
        </button>
      </div>

      <Show when={scenario() === "always-open"}>
        <AlwaysOpenDrawer />
      </Show>
      <Show when={scenario() === "controlled"}>
        <ControlledDrawer />
      </Show>
    </main>
  )
}
