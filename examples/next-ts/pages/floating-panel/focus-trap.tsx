import styles from "../../../../shared/src/css/floating-panel.module.css"
import * as floating from "@zag-js/floating-panel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-react"
import { useId, useRef } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { useFocusTrap } from "../../hooks/use-focus-trap"
import { Toolbar } from "../../components/toolbar"

export default function Page() {
  const service = useMachine(floating.machine, {
    id: useId(),
    closeOnEscape: true,
  })

  const api = floating.connect(service, normalizeProps)
  const contentRef = useRef<HTMLDivElement>(null)

  useFocusTrap(contentRef, { enabled: api.open })

  return (
    <>
      <main className="floating-panel">
        <div>
          <button {...api.getTriggerProps()}>Toggle Panel</button>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()} className={styles.Content} ref={contentRef}>
              <div {...api.getDragTriggerProps()}>
                <div {...api.getHeaderProps()} className={styles.Header}>
                  <p {...api.getTitleProps()}>Floating Panel (Focus Trap)</p>
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
                <p>Focus is trapped within this panel when open.</p>
                <label>
                  Name
                  <input type="text" placeholder="Enter name" />
                </label>
                <label>
                  Email
                  <input type="email" placeholder="Enter email" />
                </label>
                <button type="button">Submit</button>
              </div>

              {floating.resizeTriggerAxes.map((axis) => (
                <div key={axis} {...api.getResizeTriggerProps({ axis })} className={styles.ResizeTrigger} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
