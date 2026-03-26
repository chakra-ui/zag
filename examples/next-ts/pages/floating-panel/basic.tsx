import styles from "../../../../shared/src/css/floating-panel.module.css"
import * as floating from "@zag-js/floating-panel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { floatingPanelControls } from "@zag-js/shared"
import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const controls = useControls(floatingPanelControls)

  const service = useMachine(floating.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = floating.connect(service, normalizeProps)

  return (
    <>
      <main className="floating-panel">
        <div>
          <button {...api.getTriggerProps()}>Toggle Panel</button>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()} className={styles.Content}>
              <div {...api.getDragTriggerProps()}>
                <div {...api.getHeaderProps()} className={styles.Header}>
                  <p {...api.getTitleProps()}>Floating Panel</p>
                  <div {...api.getControlProps()} className={styles.Control}>
                    <button {...api.getStageTriggerProps({ stage: "minimized" })}>
                      <Minus />
                    </button>
                    <button {...api.getStageTriggerProps({ stage: "maximized" })}>
                      <Maximize2 />
                    </button>
                    <button {...api.getStageTriggerProps({ stage: "default" })}>
                      <ArrowDownLeft />
                    </button>
                    <button {...api.getCloseTriggerProps()}>
                      <XIcon />
                    </button>
                  </div>
                </div>
              </div>
              <div {...api.getBodyProps()} className={styles.Body}>
                <p>Some content</p>
              </div>

              {floating.resizeTriggerAxes.map((axis) => (
                <div key={axis} {...api.getResizeTriggerProps({ axis })} className={styles.ResizeTrigger} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
