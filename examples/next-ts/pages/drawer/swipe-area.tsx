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
        <div {...api.getSwipeAreaProps()} className={styles.swipeArea} />
        <Presence {...api.getBackdropProps()} className={styles.backdrop} />
        <div {...api.getPositionerProps()} className={styles.positioner}>
          <Presence {...api.getContentProps()} className={styles.content}>
            <div {...api.getGrabberProps()} className={styles.grabber}>
              <div {...api.getGrabberIndicatorProps()} className={styles.grabberIndicator} />
            </div>
            <div {...api.getTitleProps()}>Drawer</div>
            <p {...api.getDescriptionProps()}>Swipe up from the bottom edge to open this drawer.</p>
            <button {...api.getCloseTriggerProps()}>Close</button>
            <div className={styles.scrollable} data-testid="scrollable">
              {Array.from({ length: 100 }).map((_element, index) => (
                <div key={index}>Item {index}</div>
              ))}
            </div>
          </Presence>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["dragOffset", "snapPoint", "contentSize"]} />
      </Toolbar>
    </>
  )
}
