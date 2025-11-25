import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

export default function Page() {
  const [value, setValue] = useState("0")

  const service = useMachine(numberInput.machine, {
    id: useId(),
    value: value,
    max: 10,
    min: 0,
    clampValueOnBlur: true,
    onValueChange(details) {
      if (details.valueAsNumber > 10) {
        setValue("10")
      } else if (details.valueAsNumber < 0) {
        setValue("0")
      } else {
        setValue(details.value)
      }
    },
  })

  const api = numberInput.connect(service, normalizeProps)

  return (
    <>
      <main className="number-input">
        <div {...api.getRootProps()}>
          <div data-testid="scrubber" {...api.getScrubberProps()} />
          <label data-testid="label" {...api.getLabelProps()}>
            Enter number (0-10, clamped during typing):
          </label>
          <div {...api.getControlProps()}>
            <button data-testid="dec-button" {...api.getDecrementTriggerProps()}>
              DEC
            </button>
            <input data-testid="input" {...api.getInputProps()} />
            <button data-testid="inc-button" {...api.getIncrementTriggerProps()}>
              INC
            </button>
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <strong>Controlled value:</strong> {value}
        </div>

        <p style={{ marginTop: "1rem", color: "#666", fontSize: "0.875rem" }}>
          Try typing a value greater than 10 (e.g., "100" or "1000"). The input will be clamped back to "10" immediately
          during typing, not just on blur.
        </p>
      </main>
    </>
  )
}
