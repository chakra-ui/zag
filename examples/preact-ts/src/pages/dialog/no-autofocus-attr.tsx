import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/preact"

export default function Page() {
  const service = useMachine(dialog.machine, { id: "1" })
  const api = dialog.connect(service, normalizeProps)

  return (
    <main>
      <button {...api.getTriggerProps()}>Open dialog</button>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <button {...api.getCloseTriggerProps()} data-no-autofocus>
                Close
              </button>
              <button data-no-autofocus aria-label="Help">
                ?
              </button>
              <h2 {...api.getTitleProps()}>Delete item?</h2>
              <p {...api.getDescriptionProps()}>Close and help are skipped. Cancel receives focus.</p>
              <button>Cancel</button>
              <button>Delete</button>
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}
