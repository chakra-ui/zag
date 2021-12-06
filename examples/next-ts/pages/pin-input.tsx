import { Global } from "@emotion/react"
import { pinInput } from "@ui-machines/pin-input"
import { useMachine } from "@ui-machines/react"
import { StateVisualizer } from "components/state-visualizer"
import { useControls } from "hooks/use-controls"
import { useMount } from "hooks/use-mount"
import { pinInputStyle } from "../../../shared/style"

export default function Page() {
  const controls = useControls({
    type: { type: "select", options: ["numeric", "alphanumeric", "alphabetic"] as const, defaultValue: "numeric" },
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

  const { containerProps, getInputProps, clearValue } = pinInput.connect(state, send)

  return (
    <div>
      <Global styles={pinInputStyle} />
      <controls.ui />
      <div className="pin-input" ref={ref} {...containerProps}>
        <input data-testid="input-1" {...getInputProps({ index: 0 })} />
        <input data-testid="input-2" {...getInputProps({ index: 1 })} />
        <input data-testid="input-3" {...getInputProps({ index: 2 })} />
      </div>
      <button data-testid="clear-button" onClick={clearValue}>
        Clear
      </button>

      <StateVisualizer state={state} />
    </div>
  )
}
