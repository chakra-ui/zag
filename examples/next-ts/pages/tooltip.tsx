import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const id = "tip-1"
  const id2 = "tip-2"
  const [state, send] = useMachine(
    tooltip.machine({
      id,
    }),
  )
  const [state2, send2] = useMachine(
    tooltip.machine({
      id: id2,
    }),
  )

  const api = tooltip.connect(state, send, normalizeProps)
  const api2 = tooltip.connect(state2, send2, normalizeProps)
  return (
    <>
      <main className="tooltip">
        <div className="root">
          <>
            <button data-testid={`${id}-trigger`} {...api.triggerProps}>
              Hover me
            </button>
            {api.open && (
              <div {...api.positionerProps}>
                <div className="tooltip-content" data-testid={`${id}-tooltip`} {...api.contentProps}>
                  Tooltip
                </div>
              </div>
            )}
          </>
          <button data-testid={`${id2}-trigger`} {...api2.triggerProps}>
            Over me
          </button>
          {api2.open && (
            <Portal>
              <div {...api2.positionerProps}>
                <div className="tooltip-content" data-testid={`${id2}-tooltip`} {...api2.contentProps}>
                  Tooltip 2
                </div>
              </div>
            </Portal>
          )}
        </div>
      </main>
      <Toolbar controls={null}>
        <StateVisualizer state={state} label="Tooltip 1" />
        <StateVisualizer state={state2} label="Tooltip 2" />
      </Toolbar>
    </>
  )
}
