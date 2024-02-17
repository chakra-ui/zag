import * as dialog from "@zag-js/dialog"
import { useMachine, normalizeProps, Portal } from "@zag-js/react"
import { useId } from "react"

interface Props extends Omit<dialog.Context, "open.controlled" | "id"> {
  defaultOpen?: boolean
}

export function Dialog(props: Props) {
  const { open, defaultOpen, ...context } = props

  const [state, send] = useMachine(
    dialog.machine({
      id: useId(),
      open: open ?? defaultOpen,
    }),
    {
      context: {
        ...context,
        "open.controlled": open !== undefined,
        open,
      },
    },
  )

  const api = dialog.connect(state, send, normalizeProps)

  return (
    <>
      <button {...api.triggerProps}>Open Dialog</button>
      {api.isOpen && (
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
    </>
  )
}
