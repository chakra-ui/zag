import { Global } from "@emotion/react"
import { Portal } from "@reach/portal"
import * as Popover from "@ui-machines/popover"
import { useMachine, useSetup } from "@ui-machines/react"
import { StateVisualizer } from "components/state-visualizer"
import { useControls } from "hooks/use-controls"
import * as React from "react"
import { popoverStyle } from "../../../shared/style"

export default function Page() {
  const controls = useControls({
    modal: { type: "boolean", defaultValue: false },
    portalled: { type: "boolean", defaultValue: true },
    autoFocus: { type: "boolean", defaultValue: true },
    closeOnEsc: { type: "boolean", defaultValue: true },
  })

  const [state, send] = useMachine(Popover.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: "1" })

  const { triggerProps, contentProps, closeButtonProps, headerProps, portalled, arrowProps, innerArrowProps } =
    Popover.connect(state, send)

  const Wrapper = portalled ? Portal : React.Fragment

  return (
    <>
      <Global styles={popoverStyle} />
      <div className="popover" ref={ref}>
        <button data-testid="button-before">Button :before</button>

        <button className="popover__trigger" data-testid="popover-trigger" {...triggerProps}>
          Click me
        </button>
        <Wrapper>
          <div className="popover__content" data-testid="popover-content" {...contentProps}>
            <div className="popover__arrow" {...arrowProps}>
              <div {...innerArrowProps} />
            </div>
            <div className="popover__title" data-testid="popover-title" {...headerProps}>
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
        </Wrapper>

        <span data-testid="plain-text">I am just text</span>
        <button data-testid="button-after">Button :after</button>
      </div>

      <controls.ui />

      <StateVisualizer state={state} />
    </>
  )
}
