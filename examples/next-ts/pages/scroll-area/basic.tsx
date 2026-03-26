import styles from "../../../../shared/src/css/scroll-area.module.css"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as scrollArea from "@zag-js/scroll-area"
import { scrollAreaControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const controls = useControls(scrollAreaControls)

  const service = useMachine(scrollArea.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = scrollArea.connect(service, normalizeProps)

  return (
    <>
      <main className="scroll-area">
        <button onClick={() => api.scrollToEdge({ edge: "bottom" })}>Scroll to bottom</button>
        <div {...api.getRootProps()} className={styles.Root}>
          <div {...api.getViewportProps()} className={styles.Viewport}>
            <div {...api.getContentProps()} className={styles.Content} style={{ minWidth: "800px" }}>
              {Array.from({ length: 100 }).map((_, index) => (
                <div key={index}>{index}</div>
              ))}
            </div>
          </div>
          {api.hasOverflowY && (
            <div {...api.getScrollbarProps({ orientation: "vertical" })} className={styles.Scrollbar}>
              <div {...api.getThumbProps({ orientation: "vertical" })} className={styles.Thumb} />
            </div>
          )}
          {api.hasOverflowX && (
            <div {...api.getScrollbarProps({ orientation: "horizontal" })} className={styles.Scrollbar}>
              <div {...api.getThumbProps({ orientation: "horizontal" })} className={styles.Thumb} />
            </div>
          )}
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
