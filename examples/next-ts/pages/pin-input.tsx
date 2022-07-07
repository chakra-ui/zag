import { Global } from "@emotion/react"
import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { pinInputControls, pinInputStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(pinInputControls)

  const [state, send] = useMachine(
    pinInput.machine({
      id: useId(),
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

  const api = pinInput.connect(state, send, normalizeProps)

  return (
    <>
      <Global styles={pinInputStyle} />

      <main>
        <div>
          <div {...api.rootProps}>
            <input data-testid="input-1" {...api.getInputProps({ index: 0 })} />
            <input data-testid="input-2" {...api.getInputProps({ index: 1 })} />
            <input data-testid="input-3" {...api.getInputProps({ index: 2 })} />
          </div>
          <button data-testid="clear-button" onClick={api.clearValue}>
            Clear
          </button>
        </div>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
