import { mergeProps } from "@zag-js/core"
import * as NumberInput from "@zag-js/number-input"
import { useMachine, useSetup } from "@zag-js/react"
import { numberInputControls } from "../../../shared/controls"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(numberInputControls)

  const [state, send] = useMachine(NumberInput.machine, {
    context: controls.context,
    sync: true,
  })

  const ref = useSetup<HTMLInputElement>({ send, id: "1" })

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
