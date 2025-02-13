import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import * as tooltip from "@zag-js/tooltip"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

export default function Page() {
  const id = "tip-1"
  const id2 = "tip-2"
  const service = useMachine(tooltip.machine, { id })
  const service2 = useMachine(tooltip.machine, { id: id2 })

  const api = tooltip.connect(service, normalizeProps)
  const api2 = tooltip.connect(service2, normalizeProps)
  return (
    <>
      <main className="tooltip">
        <div className="root">
          <>
            <button data-testid={`${id}-trigger`} {...api.getTriggerProps()}>
              Hover me
            </button>
            {api.open && (
              <div {...api.getPositionerProps()}>
                <div className="tooltip-content" data-testid={`${id}-tooltip`} {...api.getContentProps()}>
                  Tooltip
                </div>
              </div>
            )}
          </>
          <button data-testid={`${id2}-trigger`} {...api2.getTriggerProps()}>
            Over me
          </button>
          {api2.open && (
            <Portal>
              <div {...api2.getPositionerProps()}>
                <div className="tooltip-content" data-testid={`${id2}-tooltip`} {...api2.getContentProps()}>
                  Tooltip 2
                </div>
              </div>
            </Portal>
          )}
        </div>
      </main>
      <Toolbar controls={null}>
        <StateVisualizer state={service} label="Tooltip 1" />
        <StateVisualizer state={service2} label="Tooltip 2" />
      </Toolbar>
    </>
  )
}
