import * as floating from "@zag-js/floating-panel"
import { normalizeProps, useMachine } from "@zag-js/react"
import { floatingPanelControls } from "@zag-js/shared"
import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(floatingPanelControls)

  const service = useMachine(floating.machine, { id: useId() })

  const api = floating.connect(service, normalizeProps)

  return (
    <>
      <main className="floating-panel">
        <div>
          <button {...api.getTriggerProps()}>Toggle Panel</button>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div {...api.getDragTriggerProps()}>
                <div {...api.getHeaderProps()}>
                  <p {...api.getTitleProps()}>Floating Panel</p>
                  <div {...api.getControlProps()}>
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
              <div {...api.getBodyProps()}>
                <p>Some content</p>
              </div>

              <div {...api.getResizeTriggerProps({ axis: "n" })} />
              <div {...api.getResizeTriggerProps({ axis: "e" })} />
              <div {...api.getResizeTriggerProps({ axis: "w" })} />
              <div {...api.getResizeTriggerProps({ axis: "s" })} />
              <div {...api.getResizeTriggerProps({ axis: "ne" })} />
              <div {...api.getResizeTriggerProps({ axis: "se" })} />
              <div {...api.getResizeTriggerProps({ axis: "sw" })} />
              <div {...api.getResizeTriggerProps({ axis: "nw" })} />
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
