import { pinInput } from "@ui-machines/pin-input"
import { normalizeProps, useMachine, useSetup, SolidPropTypes } from "@ui-machines/solid"

import { createMemo } from "solid-js"

import { StateVisualizer } from "../components/state-visualizer"

export default function Page() {
  const [state, send] = useMachine(
    pinInput.machine.withContext({
      autoFocus: true,
      onComplete(val) {
        console.log(val)
      },
    }),
  )

  const ref = useSetup<HTMLDivElement>({ send, id: "123" })

  const machineState = createMemo(() => pinInput.connect<SolidPropTypes>(state, send, normalizeProps))

  return (
    <div>
      <div style={{ width: "300px" }} ref={ref} {...machineState().containerProps}>
        <input {...machineState().getInputProps({ index: 0 })} />
        <input {...machineState().getInputProps({ index: 1 })} />
        <input {...machineState().getInputProps({ index: 2 })} />
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
