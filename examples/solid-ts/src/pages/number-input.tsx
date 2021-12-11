import { mergeProps } from "@ui-machines/core"
import * as NumberInput from "@ui-machines/number-input"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(
    NumberInput.machine.withContext({
      min: 0,
      max: 10,
      clampValueOnBlur: true,
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const number = createMemo(() => NumberInput.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div>
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
