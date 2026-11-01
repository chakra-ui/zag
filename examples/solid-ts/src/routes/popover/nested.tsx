import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { createMemo, Show, type JSX } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/popover.css"

interface PopoverProps {
  id: string
  nested?: boolean
  children?: JSX.Element
}

function Popover(props: PopoverProps) {
  const service = useMachine(popover.machine, {
    id: props.id,
    modal: false,
  })
  const api = createMemo(() => popover.connect(service, normalizeProps))

  return (
    <>
      <div data-part="root">
        <Show when={!props.nested}>
          <button data-testid="button-before">Button :before</button>
        </Show>

        <button data-testid="popover-trigger" {...api().getTriggerProps()}>
          {props.nested ? "Open Nested" : "Click me"}
        </button>

        <Show when={!props.nested}>
          <div {...api().getAnchorProps()}>anchor</div>
        </Show>

        <Portal>
          <div {...api().getPositionerProps()}>
            <div data-testid="popover-content" class="popover-content" {...api().getContentProps()}>
              <div {...api().getArrowProps()}>
                <div {...api().getArrowTipProps()} />
              </div>
              <div data-testid="popover-title" {...api().getTitleProps()}>
                Popover Title
              </div>
              <div data-part="body" data-testid="popover-body">
                <a>Non-focusable Link</a>
                <a href="#" data-testid="focusable-link">
                  Focusable Link
                </a>
                <input data-testid="input" placeholder="input" />
                <button data-testid="popover-close-button" {...api().getCloseTriggerProps()}>
                  <XIcon />
                </button>
                {props.children}
              </div>
            </div>
          </div>
        </Portal>
        <Show when={!props.nested}>
          <span data-testid="plain-text">I am just text</span>
          <button data-testid="button-after">Button :after</button>
        </Show>
      </div>
    </>
  )
}

export default function Page() {
  return (
    <>
      <main class="popover">
        <Popover id="p1">
          <Popover nested id="p2">
            <Popover nested id="p3" />
          </Popover>
        </Popover>
      </main>
    </>
  )
}
