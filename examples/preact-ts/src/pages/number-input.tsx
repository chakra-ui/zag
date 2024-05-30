import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { numberInputControls } from "@zag-js/shared"
import { useId } from "react"
import { useControls } from "../hooks/use-controls"
import { Toolbar } from "../components/toolbar"
import { StateVisualizer } from "../components/state-visualizer"

export default function NumberInput() {
  const controls = useControls(numberInputControls)

  const [state, send] = useMachine(
    numberInput.machine({
      id: useId(),
    }),
    {
      context: controls.context,
    },
  )

  const api = numberInput.connect(state, send, normalizeProps)

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
        <StateVisualizer state={state} omit={["formatter", "parser"]} />
      </Toolbar>
    </>
  )
}
