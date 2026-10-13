import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { MinusIcon, PlusIcon } from "lucide-solid"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/number-input.css"

export default function Page() {
  const min = 0
  const max = 10

  const service = useMachine(numberInput.machine, {
    id: createUniqueId(),
    allowOverflow: true,
    max,
    min,
    onValueInvalid(details) {
      if (details.valueAsNumber > max) {
        api().setValue(min)
      } else if (details.valueAsNumber < min) {
        api().setValue(max)
      }
    },
  })

  const api = createMemo(() => numberInput.connect(service, normalizeProps))

  return (
    <main>
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Enter number:</label>
        <div {...api().getControlProps()}>
          <button {...api().getDecrementTriggerProps()}>
            <MinusIcon />
          </button>
          <input {...api().getInputProps()} />
          <button {...api().getIncrementTriggerProps()}>
            <PlusIcon />
          </button>
        </div>
      </div>
    </main>
  )
}
