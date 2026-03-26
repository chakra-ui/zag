import * as drawer from "@zag-js/drawer"
import { normalizeProps, useMachine } from "@zag-js/react"
import { drawerControls } from "@zag-js/shared"
import { useId, useState } from "react"
import { Presence } from "../../components/presence"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"
import styles from "../../../shared/styles/drawer.module.css"

export default function Page() {
  const controls = useControls(drawerControls)
  const [volume, setVolume] = useState(50)

  const service = useMachine(drawer.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = drawer.connect(service, normalizeProps)

  return (
    <>
      <main>
        <button {...api.getTriggerProps()} className={styles.trigger}>
          Open
        </button>
        <Presence {...api.getBackdropProps()} className={styles.backdrop} />
        <div {...api.getPositionerProps()} className={styles.positioner}>
          <Presence {...api.getContentProps()} className={styles.content}>
            <div {...api.getGrabberProps()} className={styles.grabber}>
              <div {...api.getGrabberIndicatorProps()} className={styles.grabberIndicator} />
            </div>
            <div {...api.getTitleProps()}>Drawer + native range</div>
            <p
              {...api.getDescriptionProps()}
              style={{ padding: "0 16px", margin: "8px 0 0", fontSize: 14, color: "#555" }}
            >
              Drag the slider horizontally. The sheet should not move or steal the gesture while adjusting the range.
            </p>
            <div style={{ padding: "16px", width: "100%", boxSizing: "border-box" }}>
              <label htmlFor="drawer-range-demo" style={{ display: "block", marginBottom: 8, fontSize: 14 }}>
                Volume (native <code style={{ fontSize: 12 }}>&lt;input type=&quot;range&quot;&gt;</code>)
              </label>
              <input
                id="drawer-range-demo"
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                data-testid="drawer-native-range"
                style={{ width: "100%", touchAction: "auto" }}
              />
              <output style={{ display: "block", marginTop: 8, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
                {volume}
              </output>
            </div>
            <div className={styles.scrollable} data-testid="scrollable">
              {Array.from({ length: 40 }).map((_element, index) => (
                <div key={index} style={{ padding: "4px 16px" }}>
                  Item {index}
                </div>
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
