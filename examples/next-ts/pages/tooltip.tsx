import { Global } from "@emotion/react"
import { useMachine, useSetup } from "@zag-js/react"
import { tooltipStyles } from "@zag-js/shared"
import * as tooltip from "@zag-js/tooltip"
import { Portal } from "../components/portal"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const [state, send] = useMachine(tooltip.machine)
  const [state2, send2] = useMachine(tooltip.machine)
  const id = "tip-1"
  const id2 = "tip-2"
  const ref = useSetup<HTMLButtonElement>({ send, id })
  const ref2 = useSetup<HTMLButtonElement>({ send: send2, id: id2 })
  const api = tooltip.connect(state, send)
  const api2 = tooltip.connect(state2, send2)
  return (
    <>
      <Global styles={tooltipStyles} />
      <main>
        <div className="root">
          <button data-testid={`${id}-trigger`} ref={ref} {...api.triggerProps}>
            Over me
          </button>
          {api.isOpen && (
            <Portal>
              <div {...api.positionerProps}>
                <div data-testid={`${id}-tooltip`} {...api.contentProps}>
                  Tooltip
                </div>
              </div>
            </Portal>
          )}

          <button data-testid={`${id2}-trigger`} ref={ref2} {...api2.triggerProps}>
            Over me
          </button>
          {api2.isOpen && (
            <Portal>
              <div {...api2.positionerProps}>
                <div data-testid={`${id2}-tooltip`} {...api2.contentProps}>
                  Tooltip
                </div>
              </div>
            </Portal>
          )}
        </div>
      </main>
      <Toolbar controls={null} count={2}>
        <StateVisualizer state={state} label="Tooltip 1" />
        <StateVisualizer state={state2} label="Tooltip 2" />
      </Toolbar>
    </>
  )
}
