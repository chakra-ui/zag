import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"

export default function Page() {
  const service = useMachine(dialog.machine, { id: createUniqueId(), modal: false, closeOnInteractOutside: true })
  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <main>
      <button data-testid="trigger-1" {...api().getTriggerProps()}>
        Open Dialog
      </button>
      <input data-testid="outside-input" placeholder="Outside input" />
      <p data-testid="outside-content">The page stays interactive while the dialog is open.</p>
      <Show when={api().open}>
        <Portal>
          <div data-testid="positioner-1" {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <h2 {...api().getTitleProps()}>Non-modal dialog</h2>
              <p {...api().getDescriptionProps()}>No backdrop and no focus trap.</p>
              <input placeholder="Enter name..." />
              <button data-testid="close-1" {...api().getCloseTriggerProps()}>
                Close
              </button>
            </div>
          </div>
        </Portal>
      </Show>
    </main>
  )
}
