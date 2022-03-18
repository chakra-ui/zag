import { injectGlobal } from "@emotion/css"
import * as Popover from "@ui-machines/popover"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo, createUniqueId, PropsWithChildren } from "solid-js"
import { Portal } from "solid-js/web"
import { popoverControls } from "../../../../shared/controls"
import { popoverStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(popoverStyle)

function MaybePortal(props: PropsWithChildren<{ guard: boolean }>) {
  return <>{props.guard ? <Portal mount={document.body}>{props.children}</Portal> : props.children}</>
}

export default function Page() {
  const controls = useControls(popoverControls)

  const [state, send] = useMachine(Popover.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const popover = createMemo(() => Popover.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div className="popover" ref={ref}>
        <button data-testid="button-before">Button :before</button>
        <button data-testid="popover-trigger" {...popover().triggerProps}>
          Click me
        </button>

        <MaybePortal guard={popover().portalled}>
          <div className="popover__popper" {...popover().positionerProps}>
            <div className="popover__content" data-testid="popover-content" {...popover().contentProps}>
              <div className="popover__arrow" {...popover().arrowProps}>
                <div {...popover().innerArrowProps} />
              </div>
              <div className="popover__title" data-testid="popover-title" {...popover().titleProps}>
                Popover Title
              </div>
              <div className="popover__body" data-testid="popover-body" {...popover().descriptionProps}>
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
          </div>
        </MaybePortal>

        <span data-testid="plain-text">I am just text</span>
        <button data-testid="button-after">Button :after</button>
      </div>

      <StateVisualizer state={state} />
    </>
  )
}
