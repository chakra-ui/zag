import { Global } from "@emotion/react"
import { Portal } from "@reach/portal"
import * as Popover from "@ui-machines/popover"
import { useMachine, useSetup } from "@ui-machines/react"
import * as React from "react"
import { popoverControls } from "../../../shared/controls"
import { popoverStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(popoverControls)

  const [state, send] = useMachine(Popover.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: "1" })

  const {
    triggerProps,
    positionerProps,
    contentProps,
    closeButtonProps,
    titleProps,
    portalled,
    arrowProps,
    innerArrowProps,
    anchorProps,
  } = Popover.connect(state, send)

  const Wrapper = portalled ? Portal : React.Fragment

  return (
    <>
      <controls.ui />
      <Global styles={popoverStyle} />

      <div className="popover" ref={ref}>
        <button data-testid="button-before">Button :before</button>

        <button className="popover__trigger" data-testid="popover-trigger" {...triggerProps}>
          Click me
        </button>

        <div {...anchorProps}>anchor</div>

        <Wrapper>
          <div className="popover__popper" {...positionerProps}>
            <div className="popover__content" data-testid="popover-content" {...contentProps}>
              <div className="popover__arrow" {...arrowProps}>
                <div {...innerArrowProps} />
              </div>
              <div className="popover__title" data-testid="popover-title" {...titleProps}>
                Popover Title
              </div>
              <div className="popover__body" data-testid="popover-body">
                <a>Non-focusable Link</a>
                <a href="#" data-testid="focusable-link">
                  Focusable Link
                </a>
                <input data-testid="input" placeholder="input" />
                <button className="popover__close-button" data-testid="popover-close-button" {...closeButtonProps}>
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
