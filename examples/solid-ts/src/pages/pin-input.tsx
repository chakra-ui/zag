import { injectGlobal } from "@emotion/css"
import * as pinInput from "@ui-machines/pin-input"
import { normalizeProps, PropTypes, useMachine, useSetup } from "@ui-machines/solid"
import { createMemo, createUniqueId } from "solid-js"
import { pinInputControls } from "../../../../shared/controls"
import { pinInputStyle } from "../../../../shared/style"
import { StateVisualizer } from "../components/state-visualizer"
import { useControls } from "../hooks/use-controls"

injectGlobal(pinInputStyle)

export default function Page() {
  const controls = useControls(pinInputControls)

  const [state, send] = useMachine(pinInput.machine, {
    context: controls.context,
  })

  const ref = useSetup({ send, id: createUniqueId() })

  const api = createMemo(() => pinInput.connect<PropTypes>(state, send, normalizeProps))

  return (
    <>
      <controls.ui />

      <div ref={ref} {...api().rootProps}>
        <input data-testid="input-1" {...api().getInputProps({ index: 0 })} />
        <input data-testid="input-2" {...api().getInputProps({ index: 1 })} />
        <input data-testid="input-3" {...api().getInputProps({ index: 2 })} />
      </div>

      <button data-testid="clear-button" onClick={api().clearValue}>
        Clear
      </button>

      <StateVisualizer state={state} />
    </>
  )
}
