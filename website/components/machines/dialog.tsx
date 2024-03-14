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
      <button className="dialog" {...api.triggerProps}>
        Open Dialog
      </button>
      <Portal>
        <div className="dialog" {...api.backdropProps} />
        <div className="dialog" {...api.positionerProps}>
          <div className="dialog" {...api.contentProps}>
            <h2 className="dialog" {...api.titleProps}>
              Edit profile
            </h2>
            <p className="dialog" {...api.descriptionProps}>
              Make changes to your profile here. Click save when you are done.
            </p>

            <div>
              <input placeholder="Enter name..." />
              <button>Save</button>
            </div>
            <button className="dialog" {...api.closeTriggerProps}>
              <HiX />
            </button>
          </div>
        </div>
      </Portal>
    </>
  )
}
