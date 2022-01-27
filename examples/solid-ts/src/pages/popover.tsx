import { injectGlobal } from "@emotion/css"
import * as Popover from "@ui-machines/popover"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo, createUniqueId } from "solid-js"
import { popoverControls } from "../../../../shared/controls"
import { popoverStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(popoverStyle)

export default function Page() {
  const controls = useControls(popoverControls)

  const [state, send] = useMachine(Popover.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const popover = createMemo(() => Popover.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <>
      <div className="popover" ref={ref}>
        <button data-testid="button-before">Button :before</button>
        <button {...popover().triggerProps}>Click me</button>

        <div className="popover__content" data-testid="popover-content" {...popover().contentProps}>
          <div className="popover__arrow" {...popover().arrowProps}>
            <div {...popover().innerArrowProps} />
          </div>
          <div className="popover__title" data-testid="popover-title" {...popover().headerProps}>
            Popover Title
          </div>
          <div className="popover__body" data-testid="popover-body">
            <a>Non-focusable Link</a>
            <a href="#" data-testid="focusable-link">
              Focusable Link
            </a>
            <input data-testid="input" placeholder="input" />
            <button
              className="popover__close-button"
              data-testid="popover-close-button"
              {...popover().closeButtonProps}
            >
              X
            </button>
          </div>
        </div>

        <span data-testid="plain-text">I am just text</span>
        <button data-testid="button-after">Button :after</button>
      </div>

      <controls.ui />

      <StateVisualizer state={state} />
    </>
  )
}
