import * as dialog from "@zag-js/dialog"
import { normalizeProps, useMachine, Portal } from "@zag-js/react"
import { HiX } from "react-icons/hi"
import { useId } from "react"

export function Dialog(props: { controls: any }) {
  const [state, send] = useMachine(dialog.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = dialog.connect(state, send, normalizeProps)

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
