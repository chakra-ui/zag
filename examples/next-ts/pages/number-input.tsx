import { mergeProps } from "@zag-js/core"
import * as numberInput from "@zag-js/number-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { numberInputControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
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
        <div {...api.rootProps}>
          <div
            data-testid="scrubber"
            {...mergeProps(api.scrubberProps, { style: { width: 32, height: 32, background: "red" } })}
          />
          <label data-testid="label" {...api.labelProps}>
            Enter number:
          </label>
          <div>
            <button data-testid="dec-button" {...api.decrementButtonProps}>
              DEC
            </button>
            <input data-testid="input" {...api.inputProps} />
            <button data-testid="inc-button" {...api.incrementButtonProps}>
              INC
            </button>
          </div>
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
