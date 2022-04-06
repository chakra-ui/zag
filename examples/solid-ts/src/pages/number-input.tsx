import { mergeProps } from "@zag-js/core"
import * as NumberInput from "@zag-js/number-input"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { useControls } from "../hooks/use-controls"
import { StateVisualizer } from "../components/state-visualizer"
import { numberInputControls } from "../../../../shared/controls"

export default function Page() {
  const controls = useControls(numberInputControls)

  const [state, send] = useMachine(NumberInput.machine, {
    context: controls.context,
  })

  const ref = useSetup({ send, id: createUniqueId() })

  const number = createMemo(() => NumberInput.connect<PropTypes>(state, send, normalizeProps))

  return (
    <div>
      <controls.ui />
      <div className="root">
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
          <input data-testid="input" ref={ref} {...number().inputProps} />
          <button data-testid="inc-button" {...number().incrementButtonProps}>
            INC
          </button>
        </div>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
