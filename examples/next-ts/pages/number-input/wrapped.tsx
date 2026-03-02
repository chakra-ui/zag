import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { MinusIcon, PlusIcon } from "lucide-react"
import { useId } from "react"

export default function Page() {
  const min = 0
  const max = 10

  const service = useMachine(numberInput.machine, {
    id: useId(),
    allowOverflow: true,
    max,
    min,
    onValueInvalid(details) {
      if (details.valueAsNumber > max) {
        api.setValue(min)
      } else if (details.valueAsNumber < min) {
        api.setValue(max)
      }
    },
  })

  const api = numberInput.connect(service, normalizeProps)

  return (
    <main>
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Enter number:</label>
        <div {...api.getControlProps()}>
          <button {...api.getDecrementTriggerProps()}>
            <MinusIcon />
          </button>
          <input {...api.getInputProps()} />
          <button {...api.getIncrementTriggerProps()}>
            <PlusIcon />
          </button>
        </div>
      </div>
    </main>
  )
}
