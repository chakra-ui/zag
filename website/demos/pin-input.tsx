import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

interface PinInputProps extends Omit<pinInput.Props, "id"> {}

export function PinInput(props: PinInputProps) {
  const service = useMachine(pinInput.machine, {
    id: useId(),
    ...props,
  })

  const api = pinInput.connect(service, normalizeProps)

  return (
    <div>
      <div {...api.getRootProps()}>
        {[1, 2, 3].map((_, index) => (
          <input key={index} {...api.getInputProps({ index })} />
        ))}
      </div>
      <button onClick={api.clearValue}>Clear</button>
    </div>
  )
}
