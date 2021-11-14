import { mergeProps, numberInput } from "@ui-machines/web"
import { normalizeProps, useMachine, useSetup, SolidPropTypes } from "@ui-machines/solid"

import { createMemo } from "solid-js"

import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(
    numberInput.machine.withContext({
      min: 0,
      max: 10,
      clampValueOnBlur: true,
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "123" })

  const connect = createMemo(() => numberInput.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div>
      <div className="root">
        <div
          data-testid="scrubber"
          {...mergeProps(connect().scrubberProps, { style: { width: "32px", height: "32px", background: "red" } })}
        />
        <label data-testid="label" {...connect().labelProps}>
          Enter number:
        </label>
        <div>
          <button data-testid="dec-button" {...connect().decrementButtonProps}>
            DEC
          </button>
          <input data-testid="input" ref={ref} {...connect().inputProps} />
          <button data-testid="inc-button" {...connect().incrementButtonProps}>
            INC
          </button>
        </div>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
