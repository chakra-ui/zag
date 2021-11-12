import { pinInput } from "@ui-machines/web"
import { useMachine } from "@ui-machines/react"

import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { useControls } from "hooks/use-controls"

export default function Page() {
  const controls = useControls({
    type: { type: "select", options: ["number", "alphanumeric"] as const, defaultValue: "number" },
    mask: { type: "boolean", defaultValue: false },
  })

  const [state, send] = useMachine(
    pinInput.machine.withContext({
      onComplete(val) {
        console.log("onComplete", val)
      },
      onChange(val) {
        console.log("onChange", val)
      },
    }),
    {
      context: controls.context,
    },
  )

  const ref = useMount<HTMLDivElement>(send)

  const { getInputProps } = pinInput.connect(state, send)

  return (
    <div>
      <controls.ui />
      <div style={{ width: "300px" }} ref={ref}>
        <input {...getInputProps({ index: 0 })} />
        <input {...getInputProps({ index: 1 })} />
        <input {...getInputProps({ index: 2 })} />
      </div>

      <StateVisualizer state={state} />
    </div>
  )
}
