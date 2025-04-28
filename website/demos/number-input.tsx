import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { BiChevronDown, BiChevronUp } from "react-icons/bi"
import { useId } from "react"

export function NumberInput(props: any) {
  const service = useMachine(numberInput.machine, {
    id: useId(),
    ...props.controls,
  })

  const api = numberInput.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Enter number:</label>
      <div>
        <input {...api.getInputProps()} />
        <div>
          <button {...api.getIncrementTriggerProps()}>
            <BiChevronUp />
          </button>
          <button {...api.getDecrementTriggerProps()}>
            <BiChevronDown />
          </button>
        </div>
      </div>
    </div>
  )
}
