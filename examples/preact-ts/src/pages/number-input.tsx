import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { numberInputControls } from "@zag-js/shared"
import { useId } from "react"
import { useControls } from "../hooks/use-controls"
import { Toolbar } from "../components/toolbar"
import { StateVisualizer } from "../components/state-visualizer"

export default function NumberInput() {
  const controls = useControls(numberInputControls)

  const service = useMachine(numberInput.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = numberInput.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div {...api.getRootProps()}>
          <div data-testid="scrubber" {...api.getScrubberProps()} />
          <label data-testid="label" {...api.getLabelProps()}>
            Enter number:
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
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} omit={["formatter", "parser"]} />
      </Toolbar>
    </>
  )
}
