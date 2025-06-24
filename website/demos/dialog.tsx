import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { HiX } from "react-icons/hi"
import { useId } from "react"

interface DialogProps extends Omit<dialog.Props, "id"> {}

export function Dialog(props: DialogProps) {
  const service = useMachine(dialog.machine, {
    id: useId(),
    ...props,
  })

  const api = dialog.connect(service, normalizeProps)

  return (
    <>
      <button className="dialog" {...api.getTriggerProps()}>
        Open Dialog
      </button>
      <Portal>
        <div className="dialog" {...api.getBackdropProps()} />
        <div className="dialog" {...api.getPositionerProps()}>
          <div className="dialog" {...api.getContentProps()}>
            <h2 className="dialog" {...api.getTitleProps()}>
              Edit profile
            </h2>
            <p className="dialog" {...api.getDescriptionProps()}>
              Make changes to your profile here. Click save when you are done.
            </p>

            <div>
              <input placeholder="Enter name..." />
              <button>Save</button>
            </div>
            <button className="dialog" {...api.getCloseTriggerProps()}>
              <HiX />
            </button>
          </div>
        </div>
      </Portal>
    </>
  )
}
