import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import { Presence } from "~/components/presence"
import "@styles/popover.css"

export default function Page() {
  const service = useMachine(popover.machine, {
    id: createUniqueId(),
    modal: false,
  })

  const api = createMemo(() => popover.connect(service, normalizeProps))

  return (
    <main class="popover">
      <div data-part="root">
        <button data-testid="button-before">Button :before</button>

        <button data-testid="popover-trigger" {...api().getTriggerProps()}>
          Click me
        </button>

        <Portal>
          <div {...api().getPositionerProps()}>
            <Presence data-testid="popover-content" class="popover-content" {...api().getContentProps()}>
              <a href="#" data-testid="focusable-link">
                Focusable Link
              </a>
              <input data-testid="input" placeholder="input" />
              <button data-testid="popover-close-button" {...api().getCloseTriggerProps()}>
                <XIcon />
              </button>
            </Presence>
          </div>
        </Portal>
      </div>
    </main>
  )
}
