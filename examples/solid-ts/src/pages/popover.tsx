import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, ParentProps } from "solid-js"
import { Portal } from "solid-js/web"
import { popoverControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

function Wrapper(props: ParentProps<{ guard: boolean }>) {
  return <>{props.guard ? <Portal mount={document.body}>{props.children}</Portal> : props.children}</>
}

export default function Page() {
  const controls = useControls(popoverControls)

  const [state, send] = useMachine(popover.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => popover.connect(state, send, normalizeProps))

  return (
    <>
      <main class="popover">
        <div data-part="root">
          <button data-testid="button-before">Button :before</button>
          <button data-testid="popover-trigger" {...api().triggerProps}>
            Click me
          </button>
          <Wrapper guard={api().portalled}>
            <div {...api().positionerProps}>
              <div data-testid="popover-content" class="popover-content" {...api().contentProps}>
                <div {...api().arrowProps}>
                  <div {...api().arrowTipProps} />
                </div>
                <div data-testid="popover-title" {...api().titleProps}>
                  Popover Title
                </div>
                <div data-testid="popover-body" data-part="body">
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
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
