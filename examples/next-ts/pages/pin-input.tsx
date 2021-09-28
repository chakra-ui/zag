import { pinInput } from "@ui-machines/web"
import { useMachine } from "@ui-machines/react"

import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"

export default function Page() {
  const [state, send] = useMachine(
    pinInput.machine.withContext({
      autoFocus: true,
      onComplete(val) {
        console.log(val)
      },
    }),
  )

  const ref = useMount<HTMLDivElement>(send)

  const { getInputProps } = pinInput.connect(state, send)

  return (
    <div>
      <div style={{ width: "300px" }} ref={ref}>
        <input {...getInputProps({ index: 0 })} />
        <input {...getInputProps({ index: 1 })} />
        <input {...getInputProps({ index: 2 })} />
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
