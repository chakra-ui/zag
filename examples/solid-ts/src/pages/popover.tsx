import { injectGlobal } from "@emotion/css"
import * as popover from "@ui-machines/popover"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo, createUniqueId, PropsWithChildren } from "solid-js"
import { Portal } from "solid-js/web"
import { popoverControls } from "../../../../shared/controls"
import { popoverStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(popoverStyle)

function Wrapper(props: PropsWithChildren<{ guard: boolean }>) {
  return <>{props.guard ? <Portal mount={document.body}>{props.children}</Portal> : props.children}</>
}

export default function Page() {
  const controls = useControls(popoverControls)

  const [state, send] = useMachine(popover.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const api = createMemo(() => popover.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div data-part="root" ref={ref}>
        <button data-testid="button-before">Button :before</button>
        <button data-testid="popover-trigger" {...api().triggerProps}>
          Click me
        </button>

        <Wrapper guard={api().portalled}>
          <div {...api().positionerProps}>
            <div data-testid="popover-content" {...api().contentProps}>
              <div {...api().arrowProps}>
                <div {...api().innerArrowProps} />
              </div>
              <div data-testid="popover-title" {...api().titleProps}>
                Popover Title
              </div>
              <div data-testid="popover-body" {...api().descriptionProps}>
                <a>Non-focusable Link</a>
                <a href="#" data-testid="focusable-link">
                  Focusable Link
                </a>
                <input data-testid="input" placeholder="input" />
                <button data-testid="popover-close-button" {...api().closeButtonProps}>
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
