import * as popover from "@zag-js/popover"
import { popoverControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ParentProps, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"

function Wrapper(props: ParentProps<{ guard: boolean }>) {
  return <>{props.guard ? <Portal mount={document.body}>{props.children}</Portal> : props.children}</>
}

export default function Page() {
  const controls = useControls(popoverControls)

  const service = useMachine(popover.machine, { id: createUniqueId() })

  const api = createMemo(() => popover.connect(service, normalizeProps))

  return (
    <>
      <main class="popover">
        <div data-part="root">
          <button data-testid="button-before">Button :before</button>
          <button data-testid="popover-trigger" {...api().getTriggerProps()}>
            Click me
            <div {...api().getIndicatorProps()}>{">"}</div>
          </button>
          <Wrapper guard={api().portalled}>
            <div {...api().getPositionerProps()}>
              <Presence data-testid="popover-content" class="popover-content" {...api().getContentProps()}>
                <div {...api().getArrowProps()}>
                  <div {...api().getArrowTipProps()} />
                </div>
                <div data-testid="popover-title" {...api().getTitleProps()}>
                  Popover Title
                </div>
                <div data-testid="popover-body" data-part="body">
                  <a>Non-focusable Link</a>
                  <a href="#" data-testid="focusable-link">
                    Focusable Link
                  </a>
                  <input data-testid="input" placeholder="input" />
                  <button data-testid="popover-close-button" {...api().getCloseTriggerProps()}>
                    X
                  </button>
                </div>
              </Presence>
            </div>
          </Wrapper>
          <span data-testid="plain-text">I am just text</span>
          <button data-testid="button-after">Button :after</button>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
