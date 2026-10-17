import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default function Page() {
  const service = useMachine(popover.machine, { id: useId() })

  const api = popover.connect(service, normalizeProps)

  return (
    <>
      <main className="popover">
        <div data-part="root">
          <button data-testid="popover-trigger" {...api.getTriggerProps()}>
            Click me
          </button>

          <div {...api.getPositionerProps()}>
            {api.open && (
              <div data-testid="popover-content" className="popover-content" {...api.getContentProps()}>
                <div data-testid="popover-title" {...api.getTitleProps()}>
                  Popover Title
                </div>
                <div data-testid="popover-description" {...api.getDescriptionProps()}>
                  Popover Description
                </div>
                <button data-testid="popover-close-button" {...api.getCloseTriggerProps()}>
                  X
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
