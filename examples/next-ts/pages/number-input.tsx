/* eslint-disable jsx-a11y/label-has-associated-control */
import { mergeProps, numberInput } from "@ui-machines/web"
import { useMachine } from "@ui-machines/react"

import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { useControls } from "hooks/use-controls"

export default function Page() {
  const controls = useControls({
    clampValueOnBlur: { type: "boolean", defaultValue: true },
    step: { type: "number", defaultValue: 1 },
    precision: { type: "number", defaultValue: 0 },
    min: { type: "number", defaultValue: 0 },
    max: { type: "number", defaultValue: 100 },
  })

  const [state, send] = useMachine(numberInput.machine, {
    context: controls.context,
  })

  const ref = useMount<HTMLInputElement>(send)

  const { inputProps, decrementButtonProps, incrementButtonProps, scrubberProps, labelProps } = numberInput.connect(
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
