import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

export default function Page() {
  const [value, setValue] = useState("")

  const service = useMachine(numberInput.machine, {
    id: useId(),
    value,
    onValueChange(details) {
      // a controlled setup that clamps to 10 and refuses the excess
      setValue(details.valueAsNumber > 10 ? "10" : details.value)
    },
  })

  const api = numberInput.connect(service, normalizeProps)

  return (
    <>
      <main className="number-input">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Clamped number input (max 10)</label>
          <div {...api.getControlProps()}>
            <button {...api.getDecrementTriggerProps()}>DEC</button>
            <input data-testid="input" {...api.getInputProps()} />
            <button {...api.getIncrementTriggerProps()}>INC</button>
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <div>
            Parent value: <output data-testid="parent-value">{value}</output>
          </div>
          <div>
            Machine valueAsNumber: <output data-testid="value-as-number">{api.valueAsNumber}</output>
          </div>
        </div>
      </main>
    </>
  )
}
