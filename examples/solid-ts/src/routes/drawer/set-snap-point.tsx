import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { Presence } from "~/components/presence"
import styles from "@styles/drawer.module.css"

export default function Page() {
  const [log, setLog] = createSignal<(string | number | null)[]>([])

  const service = useMachine(drawer.machine, {
    id: createUniqueId(),
    snapPoints: ["20rem", "30rem", 1],
    defaultSnapPoint: "20rem",
    closeOnInteractOutside: false,
    onSnapPointChange(details) {
      setLog((prev) => [...prev, details.snapPoint])
    },
  })

  const api = createMemo(() => drawer.connect(service, normalizeProps))

  return (
    <main>
      <div data-testid="snap-point">{String(api().snapPoint)}</div>
      <div data-testid="snap-point-log">{log().join(",")}</div>
      <div data-testid="open-state">{String(api().open)}</div>

      <button class={styles.trigger} {...api().getTriggerProps()}>
        Open
      </button>

      <Presence class={styles.backdrop} {...api().getBackdropProps()} />
      <div class={styles.positioner} {...api().getPositionerProps()}>
        <Presence class={styles.content} {...api().getContentProps()}>
          <div class={styles.grabber} {...api().getGrabberProps()}>
            <div class={styles.grabberIndicator} {...api().getGrabberIndicatorProps()} />
          </div>
          <div {...api().getTitleProps()}>Drawer</div>

          <button data-testid="reset" onClick={() => setLog([])}>
            Reset log
          </button>

          <button data-testid="set-30" onClick={() => api().setSnapPoint("30rem")}>
            setSnapPoint(30rem)
          </button>

          <button
            data-testid="set-30-then-20"
            onClick={() => {
              api().setSnapPoint("30rem")
              api().setSnapPoint("20rem")
            }}
          >
            setSnapPoint(30rem) then setSnapPoint(20rem)
          </button>

          <button
            data-testid="set-30-then-full"
            onClick={() => {
              api().setSnapPoint("30rem")
              api().setSnapPoint(1)
            }}
          >
            setSnapPoint(30rem) then setSnapPoint(1)
          </button>

          <button
            data-testid="set-30-repeatedly"
            onClick={() => {
              for (let i = 0; i < 5; i++) api().setSnapPoint("30rem")
            }}
          >
            setSnapPoint(30rem) five times
          </button>
        </Presence>
      </div>
    </main>
  )
}
