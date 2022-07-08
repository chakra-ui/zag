import { mergeProps } from "@zag-js/core"
import * as numberInput from "@zag-js/number-input"
import { numberInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(numberInputControls)

  const [state, send] = useMachine(numberInput.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const number = createMemo(() => numberInput.connect(state, send, normalizeProps))

  return (
    <>
      <main>
        <div {...number().rootProps}>
          <div
            data-testid="scrubber"
            {...mergeProps(number().scrubberProps, { style: { width: "32px", height: "32px", background: "red" } })}
          />
          <label data-testid="label" {...number().labelProps}>
            Enter number:
          </label>
          <div>
            <button data-testid="dec-button" {...number().decrementButtonProps}>
              DEC
            </button>
            <input data-testid="input" {...number().inputProps} />
            <button data-testid="inc-button" {...number().incrementButtonProps}>
              INC
            </button>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
