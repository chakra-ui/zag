import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export function PinInput(props: any) {
  const [state, send] = useMachine(pinInput.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = pinInput.connect(state, send, normalizeProps)

  return (
    <div>
      <div {...api.rootProps}>
        {[1, 2, 3].map((_, index) => (
          <input key={index} {...api.getInputProps({ index })} />
        ))}
      </div>
      <button onClick={api.clearValue}>Clear</button>
    </div>
  )
}
