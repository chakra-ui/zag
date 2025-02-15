import * as editable from "@zag-js/editable"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export function Editable(props: any) {
  const service = useMachine(editable.machine, {
    id: useId(),
    ...props.controls,
  })

  const api = editable.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div {...api.getAreaProps()}>
        <input {...api.getInputProps()} />
        <span {...api.getPreviewProps()} />
      </div>

      <div>
        {!api.editing && <button {...api.getEditTriggerProps()}>Edit</button>}
        {api.editing && (
          <div>
            <button {...api.getSubmitTriggerProps()}>Save</button>
            <button {...api.getCancelTriggerProps()}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}
