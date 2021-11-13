import { pinInput } from "@ui-machines/web"
import { useMachine } from "@ui-machines/react"

import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"
import { useControls } from "hooks/use-controls"
import { Global } from "@emotion/react"
import { pinInputStyle } from "../../../shared/style"

export default function Page() {
  const controls = useControls({
    type: { type: "select", options: ["numeric", "alphanumeric", "alphabetic"] as const, defaultValue: "number" },
    mask: { type: "boolean", defaultValue: false },
    otp: { type: "boolean", defaultValue: false },
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

  const { getInputProps, clearValue } = pinInput.connect(state, send)

  return (
    <div>
      <Global styles={pinInputStyle} />
      <controls.ui />
      <div className="pin-input" ref={ref}>
        <input {...getInputProps({ index: 0 })} />
        <input {...getInputProps({ index: 1 })} />
        <input {...getInputProps({ index: 2 })} />
      </div>
      <button data-testid="clear" onClick={clearValue}>
        Clear
      </button>

      <StateVisualizer state={state} />
    </div>
  )
}
