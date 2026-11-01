import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/dialog.css"

export default function Page() {
  const service = useMachine(dialog.machine, {
    id: createUniqueId(),
    // opt out of initial focus entirely: nobody clicked, so nothing should ring
    initialFocusEl: () => false,
  })
  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <main>
      <input data-testid="outside-input" placeholder="Focus stays here" />
      <button data-testid="open-button" onClick={() => api().setOpen(true)}>
        Open dialog programmatically
      </button>
      <Show when={api().open}>
        <Portal>
          <div {...api().getBackdropProps()} />
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <button {...api().getCloseTriggerProps()}>
                <XIcon />
              </button>
              <h2 {...api().getTitleProps()}>Special offer</h2>
              <p {...api().getDescriptionProps()}>Opened without moving focus. Tab and Escape still work.</p>
              <input placeholder="Enter name..." />
              <button>Save</button>
            </div>
          </div>
        </Portal>
      </Show>
    </main>
  )
}
