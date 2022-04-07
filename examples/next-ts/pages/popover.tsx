import { Global } from "@emotion/react"
import { Portal } from "@reach/portal"
import * as popover from "@zag-js/popover"
import { useMachine, useSetup } from "@zag-js/react"
import * as React from "react"
import { popoverControls } from "../../../shared/controls"
import { popoverStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(popoverControls)

  const [state, send] = useMachine(popover.machine, {
    context: controls.context,
  })

  const ref = useSetup({ send, id: "1" })

  const api = popover.connect(state, send)

  const Wrapper = api.portalled ? Portal : React.Fragment

  return (
    <>
      <controls.ui />
      <Global styles={popoverStyle} />

      <div className="popover" data-part="root" ref={ref}>
        <button data-testid="button-before">Button :before</button>

        <button data-testid="popover-trigger" {...api.triggerProps}>
          Click me
        </button>

        <div {...api.anchorProps}>anchor</div>

        <Wrapper>
          <div {...api.positionerProps}>
            <div data-testid="popover-content" {...api.contentProps}>
              <div {...api.arrowProps}>
                <div {...api.innerArrowProps} />
              </div>
              <div data-testid="popover-title" {...api.titleProps}>
                Popover Title
              </div>
              <div data-testid="popover-body">
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

      <StateVisualizer state={state} />
    </>
  )
}
