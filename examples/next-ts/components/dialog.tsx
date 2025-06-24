import * as dialog from "@zag-js/dialog"
import { useMachine, normalizeProps, Portal } from "@zag-js/react"
import { useId } from "react"

interface Props extends Omit<dialog.Props, "id"> {}

export function Dialog(props: Props = {}) {
  const { open, defaultOpen, ...context } = props

  const service = useMachine(dialog.machine, {
    id: useId(),
    defaultOpen,
    open,
    ...context,
  })

  const api = dialog.connect(service, normalizeProps)

  return (
    <>
      <button {...api.getTriggerProps()}>Open Dialog</button>
      {api.open && (
        <Portal>
          <div {...api.getBackdropProps()} />
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <h2 {...api.getTitleProps()}>Edit profile</h2>
              <p {...api.getDescriptionProps()}>Make changes to your profile here. Click save when you are done.</p>
              <div>
                <input placeholder="Enter name..." />
                <button>Save</button>
              </div>
              <button {...api.getCloseTriggerProps()}>Close</button>
            </div>
          </div>
        </Portal>
      )}
    </>
  )
}
