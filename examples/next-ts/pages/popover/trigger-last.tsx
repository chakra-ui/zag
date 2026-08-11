import * as popover from "@zag-js/popover"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId } from "react"
import { Presence } from "../../components/presence"

export default function Page() {
  const service = useMachine(popover.machine, {
    id: useId(),
    modal: false,
    portalled: true,
  })

  const api = popover.connect(service, normalizeProps)

  return (
    <main className="popover">
      <div data-part="root">
        <button data-testid="button-before">Button :before</button>

        <button data-testid="popover-trigger" {...api.getTriggerProps()}>
          Click me
        </button>

        <Portal>
          <div {...api.getPositionerProps()}>
            <Presence data-testid="popover-content" className="popover-content" {...api.getContentProps()}>
              <a href="#" data-testid="focusable-link">
                Focusable Link
              </a>
              <input data-testid="input" placeholder="input" />
              <button data-testid="popover-close-button" {...api.getCloseTriggerProps()}>
                X
              </button>
            </Presence>
          </div>
        </Portal>
      </div>
    </main>
  )
}
