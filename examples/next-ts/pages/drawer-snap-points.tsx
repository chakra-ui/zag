import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/react"
import { drawerControls } from "@zag-js/shared"
import { useId } from "react"
import { Presence } from "../components/presence"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import styles from "../../shared/styles/drawer.module.css"

export default function Page() {
  const controls = useControls(drawerControls)

  const service = useMachine(drawer.machine, {
    id: useId(),
    snapPoints: [0.25, "250px", 1],
    ...controls.context,
  })

  const api = drawer.connect(service, normalizeProps)

  return (
    <>
      <main>
        <button className={styles.trigger} {...api.getTriggerProps()}>
          Open
        </button>
        <Presence className={styles.backdrop} {...api.getBackdropProps()} />
        <div className={styles.positioner} {...api.getPositionerProps()}>
          <Presence className={styles.content} {...api.getContentProps()}>
            <div className={styles.grabber} {...api.getGrabberProps()}>
              <div className={styles.grabberIndicator} {...api.getGrabberIndicatorProps()} />
            </div>
            <div {...api.getTitleProps()}>Drawer</div>
            <div data-no-drag className={styles.noDrag}>
              No drag area
            </div>
            <div className={styles.scrollable}>
              {Array.from({ length: 100 }).map((_element, index) => (
                <div key={index}>Item {index}</div>
              ))}
            </div>
          </Presence>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} context={["dragOffset", "snapPoint", "resolvedActiveSnapPoint"]} />
      </Toolbar>
    </>
  )
}
