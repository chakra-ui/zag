import * as floating from "@zag-js/floating-panel"
import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-react"
import { Fragment, useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default function Page() {
  const service = useMachine(floating.machine, {
    id: useId(),
    closeOnEscape: true,
    defaultSize: { width: 400, height: 300 },
  })

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
                  <p {...api.getTitleProps()}>Floating Panel (Nested Popover)</p>
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
                <p>Escape closes the popover first, then the panel.</p>
                <Popover />
              </div>

              {floating.resizeTriggerAxes.map((axis) => (
                <div key={axis} {...api.getResizeTriggerProps({ axis })} />
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

function Popover() {
  const service = useMachine(popover.machine, {
    id: useId(),
    portalled: false,
  })

  const api = popover.connect(service, normalizeProps)
  const Wrapper = api.portalled ? Portal : Fragment

  return (
    <div>
      <button {...api.getTriggerProps()}>Open Popover</button>
      <Wrapper>
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div {...api.getTitleProps()}>Nested Popover</div>
            <div {...api.getDescriptionProps()}>Press Escape to close this popover without closing the panel.</div>
            <button {...api.getCloseTriggerProps()}>Close Popover</button>
          </div>
        </div>
      </Wrapper>
    </div>
  )
}
