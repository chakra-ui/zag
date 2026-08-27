import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"

export default function Page() {
  const service = useMachine(dialog.machine, { id: createUniqueId() })
  const api = createMemo(() => dialog.connect(service, normalizeProps))

  return (
    <main>
      <button {...api().getTriggerProps()}>Open dialog</button>
      <Show when={api().open}>
        <Portal>
          <div {...api().getBackdropProps()} />
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <button {...api().getCloseTriggerProps()} data-no-autofocus>
                Close
              </button>
              <button data-no-autofocus aria-label="Help">
                ?
              </button>
              <h2 {...api().getTitleProps()}>Delete item?</h2>
              <p {...api().getDescriptionProps()}>Close and help are skipped. Cancel receives focus.</p>
              <button>Cancel</button>
              <button>Delete</button>
            </div>
          </div>
        </Portal>
      </Show>
    </main>
  )
}
