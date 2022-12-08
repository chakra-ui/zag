import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { popoverControls } from "@zag-js/shared"
import * as React from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(popoverControls)

  const [state, send] = useMachine(
    popover.machine({
      id: React.useId(),
    }),
    {
      context: controls.context,
    },
  )

  const api = popover.connect(state, send, normalizeProps)

  const Wrapper = api.portalled ? Portal : React.Fragment

  return (
    <>
      <main className="popover">
        <div data-part="root">
          <button data-testid="button-before">Button :before</button>

          <button data-testid="popover-trigger" {...api.triggerProps}>
            Click me
          </button>

          <div {...api.anchorProps}>anchor</div>

          <Wrapper>
            <div {...api.positionerProps}>
              <div data-testid="popover-content" className="popover-content" {...api.contentProps}>
                <div {...api.arrowProps}>
                  <div {...api.arrowTipProps} />
                </div>
                <div data-testid="popover-title" {...api.titleProps}>
                  Popover Title
                </div>
                <div data-part="body" data-testid="popover-body">
                  <a>Non-focusable Link</a>
                  <a href="#" data-testid="focusable-link">
                    Focusable Link
                  </a>
                  <input data-testid="input" placeholder="input" />
                  <button data-testid="popover-close-button" {...api.closeButtonProps}>
                    X
                  </button>
                </div>
              </div>
            </div>
          </Wrapper>
          <span data-testid="plain-text">I am just text</span>
          <button data-testid="button-after">Button :after</button>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
