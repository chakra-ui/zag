import { mergeProps } from "@zag-js/core"
import * as numberInput from "@zag-js/number-input"
import { useMachine, useSetup } from "@zag-js/react"
import { useId } from "react"
import { numberInputControls } from "../../../shared/controls"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(numberInputControls)

  const [state, send] = useMachine(numberInput.machine, {
    context: controls.context,
    sync: true,
  })

  const ref = useSetup<HTMLInputElement>({ send, id: useId() })

  const api = numberInput.connect(state, send)

  return (
    <div>
      <controls.ui />
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
          <input data-testid="input" ref={ref} {...api.inputProps} />
          <button data-testid="inc-button" {...api.incrementButtonProps}>
            INC
          </button>
        </div>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
