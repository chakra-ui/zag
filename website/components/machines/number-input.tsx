import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { BiChevronDown, BiChevronUp } from "react-icons/bi"
import { useId } from "react"

export function NumberInput(props: any) {
  const [state, send] = useMachine(
    numberInput.machine({ id: useId(), ...props.defaultContext }),
    {
      context: props.controls,
    },
  )

  const api = numberInput.connect(state, send, normalizeProps)

  return (
    <div {...api.rootProps}>
      <label {...api.labelProps}>Enter number:</label>
      <div>
        <input {...api.inputProps} />
        <div>
          <button {...api.incrementTriggerProps}>
            <BiChevronUp />
          </button>
          <button {...api.decrementTriggerProps}>
            <BiChevronDown />
          </button>
        </div>
      </div>
    </div>
  )
}
