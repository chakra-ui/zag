import { mergeProps } from "@ui-machines/core"
import * as NumberInput from "@ui-machines/number-input"
import { normalizeProps, SolidPropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo, createUniqueId } from "solid-js"
import { useControls } from "../hooks/use-controls"
import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const controls = useControls({
    clampValueOnBlur: { type: "boolean", defaultValue: true },
    step: { type: "number", defaultValue: 1 },
    precision: { type: "number", defaultValue: 0 },
    min: { type: "number", defaultValue: 0 },
    max: { type: "number", defaultValue: 10 },
  })

  const [state, send] = useMachine(NumberInput.machine, {
    context: controls.context,
  })

  const ref = useSetup<HTMLDivElement>({ send, id: createUniqueId() })

  const number = createMemo(() => NumberInput.connect<SolidPropTypes>(state, send, normalizeProps))

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
