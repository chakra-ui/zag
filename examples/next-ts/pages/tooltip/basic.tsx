import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { tooltipControls } from "@zag-js/shared"
import * as tooltip from "@zag-js/tooltip"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { Presence } from "../../components/presence"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const id = "tip-1"
  const id2 = "tip-2"
  const controls = useControls(tooltipControls)
  const service = useMachine(tooltip.machine, { id, ...controls.context })
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
            <Portal>
              <div {...api.getPositionerProps()}>
                <Presence className="tooltip-content" data-testid={`${id}-tooltip`} {...api.getContentProps()}>
                  Tooltip
                </Presence>
              </div>
            </Portal>
          </>
          <button data-testid={`${id2}-trigger`} {...api2.getTriggerProps()}>
            Over me
          </button>
          <Portal>
            <div {...api2.getPositionerProps()}>
              <Presence className="tooltip-content" data-testid={`${id2}-tooltip`} {...api2.getContentProps()}>
                Tooltip 2
              </Presence>
            </div>
          </Portal>
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} label="Tooltip 1" />
        <StateVisualizer state={service2} label="Tooltip 2" />
      </Toolbar>
    </>
  )
}
