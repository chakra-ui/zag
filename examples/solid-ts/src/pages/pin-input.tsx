import { injectGlobal } from "@emotion/css"
import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine, useSetup } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { pinInputControls, pinInputStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

injectGlobal(pinInputStyle)

export default function Page() {
  const controls = useControls(pinInputControls)

  const [state, send] = useMachine(pinInput.machine, {
    context: controls.context,
  })

  const ref = useSetup({ send, id: createUniqueId() })

  const api = createMemo(() => pinInput.connect(state, send, normalizeProps))

  return (
    <>
      <main>
        <div>
          <div ref={ref} {...api().rootProps}>
            <input data-testid="input-1" {...api().getInputProps({ index: 0 })} />
            <input data-testid="input-2" {...api().getInputProps({ index: 1 })} />
            <input data-testid="input-3" {...api().getInputProps({ index: 2 })} />
          </div>
          <button data-testid="clear-button" onClick={api().clearValue}>
            Clear
          </button>
        </div>
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
