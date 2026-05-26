import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import styles from "../../../../shared/styles/drawer.module.css"

export default function Page() {
  const service = useMachine(drawer.machine, () => ({
    id: createUniqueId(),
  }))

  const api = createMemo(() => drawer.connect(service, normalizeProps))

  return (
    <>
      <main>
        <button class={styles.trigger} {...api().getTriggerProps()}>
          Open Drawer
        </button>
        <Presence class={styles.backdrop} {...api().getBackdropProps()} />
        <div class={styles.positioner} {...api().getPositionerProps()}>
          <Presence class={styles.content} {...api().getContentProps()}>
            <div class={styles.grabber} {...api().getGrabberProps()}>
              <div class={styles.grabberIndicator} {...api().getGrabberIndicatorProps()} />
            </div>
            <div {...api().getTitleProps()}>Cross-Axis Scroll</div>
            <p {...api().getDescriptionProps()}>
              Try scrolling the image carousel horizontally. It should scroll without triggering the drawer drag.
            </p>

            <div
              data-testid="horizontal-scroll"
              style={{
                display: "flex",
                gap: "12px",
                "overflow-x": "auto",
                padding: "16px",
              }}
            >
              <For each={Array.from({ length: 10 })}>
                {(_item, i) => (
                  <div
                    style={{
                      width: "200px",
                      height: "120px",
                      "border-radius": "12px",
                      "flex-shrink": 0,
                      background: "#e5e7eb",
                      display: "flex",
                      "align-items": "center",
                      "justify-content": "center",
                      "font-size": "24px",
                      "font-weight": "bold",
                      color: "#6b7280",
                    }}
                  >
                    {i() + 1}
                  </div>
                )}
              </For>
            </div>

            <div class={styles.scrollable} data-testid="scrollable">
              <For each={Array.from({ length: 50 })}>
                {(_element, index) => <div style={{ padding: "4px 16px" }}>Item {index()}</div>}
              </For>
            </div>
          </Presence>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["dragOffset", "snapPoint"]} />
      </Toolbar>
    </>
  )
}
