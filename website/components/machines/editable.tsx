import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export function Editable(props: any) {
  const [state, send] = useMachine(editable.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = editable.connect(state, send, normalizeProps)

  return (
    <div {...api.rootProps}>
      <div {...api.areaProps}>
        <input {...api.inputProps} />
        <span {...api.previewProps} />
      </div>

      <div>
        {!api.editing && <button {...api.editTriggerProps}>Edit</button>}
        {api.editing && (
          <div>
            <button {...api.submitTriggerProps}>Save</button>
            <button {...api.cancelTriggerProps}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}
