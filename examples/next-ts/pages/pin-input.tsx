import { Global } from "@emotion/react"
import * as pinInput from "@zag-js/pin-input"
import { useMachine, useSetup } from "@zag-js/react"
import { pinInputControls } from "../../../shared/controls"
import { pinInputStyle } from "../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(pinInputControls)

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

  const ref = useSetup({ send, id: "1" })

  const api = pinInput.connect(state, send)

  return (
    <>
      <Global styles={pinInputStyle} />
      <controls.ui />

      <div ref={ref} {...api.rootProps}>
        <input data-testid="input-1" {...api.getInputProps({ index: 0 })} />
        <input data-testid="input-2" {...api.getInputProps({ index: 1 })} />
        <input data-testid="input-3" {...api.getInputProps({ index: 2 })} />
      </div>
      <button data-testid="clear-button" onClick={api.clearValue}>
        Clear
      </button>

      <StateVisualizer state={state} />
    </>
  )
}
