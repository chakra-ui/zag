import { numberInput } from "@ui-machines/web"
import { normalizeProps, useMachine, useSetup } from "@ui-machines/solid"

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

  const machineState = createMemo(() => numberInput.connect(state, send, normalizeProps))

  return (
    <div>
      <div>
        <button {...machineState().decrementButtonProps}>DEC</button>
        <input ref={ref} {...machineState().inputProps} />
        <button {...machineState().incrementButtonProps}>INC</button>
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
