import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import styles from "../../../shared/styles/drawer.module.css"

export default function Page() {
  const service = useMachine(drawer.machine, {
    id: useId(),
  })

  const api = drawer.connect(service, normalizeProps)

  return (
    <>
      <main>
        <button className={styles.trigger} {...api.getTriggerProps()}>
          Open Drawer
        </button>
        <Presence className={styles.backdrop} {...api.getBackdropProps()} />
        <div className={styles.positioner} {...api.getPositionerProps()}>
          <Presence className={styles.content} {...api.getContentProps()}>
            <div className={styles.grabber} {...api.getGrabberProps()}>
              <div className={styles.grabberIndicator} {...api.getGrabberIndicatorProps()} />
            </div>
            <div {...api.getTitleProps()}>Cross-Axis Scroll</div>
            <p {...api.getDescriptionProps()}>
              Try scrolling the image carousel horizontally. It should scroll without triggering the drawer drag.
            </p>

            {/* Horizontal scrollable content inside a vertical-swipe drawer */}
            <div
              data-testid="horizontal-scroll"
              style={{
                display: "flex",
                gap: "12px",
                overflowX: "auto",
                padding: "16px",
              }}
            >
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  style={{
                    width: "200px",
                    height: "120px",
                    borderRadius: "12px",
                    flexShrink: 0,
                    background: "#e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#6b7280",
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Vertical scrollable content */}
            <div className={styles.scrollable} data-testid="scrollable">
              {Array.from({ length: 50 }).map((_, index) => (
                <div key={index} style={{ padding: "4px 16px" }}>
                  Item {index}
                </div>
              ))}
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
