/* eslint-disable jsx-a11y/label-has-associated-control */
import { mergeProps } from "@ui-machines/core"
import * as NumberInput from "@ui-machines/number-input"
import { useMachine } from "@ui-machines/react"
import { StateVisualizer } from "components/state-visualizer"
import { useControls } from "hooks/use-controls"
import { useMount } from "hooks/use-mount"

export default function Page() {
  const controls = useControls({
    clampValueOnBlur: { type: "boolean", defaultValue: true },
    step: { type: "number", defaultValue: 1 },
    precision: { type: "number", defaultValue: 0 },
    min: { type: "number", defaultValue: 0 },
    max: { type: "number", defaultValue: 100 },
  })

  const [state, send] = useMachine(NumberInput.machine, {
    context: controls.context,
    sync: true,
  })

  const ref = useMount<HTMLInputElement>(send)

  const { inputProps, decrementButtonProps, incrementButtonProps, scrubberProps, labelProps } = NumberInput.connect(
    state,
    send,
  )

  return (
    <div>
      <controls.ui />
      <div className="root">
        <div
          data-testid="scrubber"
          {...mergeProps(scrubberProps, { style: { width: 32, height: 32, background: "red" } })}
        />
        <label data-testid="label" {...labelProps}>
          Enter number:
        </label>
        <div>
          <button data-testid="dec-button" {...decrementButtonProps}>
            DEC
          </button>
          <input data-testid="input" ref={ref} {...inputProps} />
          <button data-testid="inc-button" {...incrementButtonProps}>
            INC
          </button>
        </div>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
