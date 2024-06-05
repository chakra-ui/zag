import * as zagSwitch from "@zag-js/switch"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

type SwitchProps = {
  controls: {
    disabled: boolean
  }
}

export function Switch(props: SwitchProps) {
  const [state, send] = useMachine(zagSwitch.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = zagSwitch.connect(state, send, normalizeProps)

  return (
    <div>
      <label {...api.getRootProps()}>
        <input {...api.getHiddenInputProps()} />
        <span {...api.getControlProps()}>
          <span {...api.getThumbProps()} />
        </span>
        <span {...api.getLabelProps()}>{api.checked ? "On" : "Off"}</span>
      </label>
    </div>
  )
}
