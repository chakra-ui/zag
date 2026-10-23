import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { tooltipControls } from "@zag-js/shared"
import * as tooltip from "@zag-js/tooltip"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { Presence } from "../../components/presence"
import { useControls } from "../../hooks/use-controls"

export default function Page() {
  const id = "tip-1"
  const controls = useControls(tooltipControls)
  const service = useMachine(tooltip.machine, { id, ...controls.context })
  const api = tooltip.connect(service, normalizeProps)

  return (
    <>
      <main className="tooltip">
        <div className="root">
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
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
