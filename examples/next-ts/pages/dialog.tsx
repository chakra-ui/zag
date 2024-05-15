import * as dialog from "@zag-js/dialog"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"

export default function Dialog() {
  const [state, send] = useMachine(dialog.machine({ id: "1" }))
  const api = dialog.connect(state, send, normalizeProps)

  return (
    <main>
      <button {...api.triggerProps}> Click me</button>
      {api.open && (
        <Portal>
          <div {...api.backdropProps} />
          <div {...api.positionerProps}>
            <div {...api.contentProps}>
              <h2 {...api.titleProps}>Edit profile</h2>
              <p {...api.descriptionProps}>Make changes to your profile here. Click save when you are done.</p>
              <div>
                <input placeholder="Enter name..." />
                <button>Save</button>
              </div>
              <button {...api.closeTriggerProps}>Close</button>
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}
