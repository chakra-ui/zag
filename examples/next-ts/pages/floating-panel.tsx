import * as floatingPanel from "@zag-js/floating-panel"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { floatingPanelControls } from "@zag-js/shared"
import { XIcon } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(floatingPanelControls)

  const [state, send] = useMachine(floatingPanel.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = floatingPanel.connect(state, send, normalizeProps)

  return (
    <>
      <main className="floating-panel">
        <div>
          <button {...api.triggerProps}>Toggle Panel</button>
          <Portal>
            <div {...api.positionerProps}>
              <div {...api.contentProps}>
                <div {...api.getResizeTriggerProps({ axis: "n" })} />
                <div {...api.getResizeTriggerProps({ axis: "e" })} />
                <div {...api.getResizeTriggerProps({ axis: "w" })} />
                <div {...api.getResizeTriggerProps({ axis: "s" })} />
                <div {...api.headerProps}>
                  <p {...api.titleProps}>Floating Panel</p>
                  <button {...api.closeTriggerProps}>
                    <XIcon />
                  </button>
                </div>
                <div {...api.bodyProps}>
                  <p>Some content</p>
                </div>
              </div>
            </div>
          </Portal>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
