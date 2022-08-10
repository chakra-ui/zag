import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { pinInputControls, pinInputStyle } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"
import serialize from "form-serialize"

injectGlobal(pinInputStyle)

export default function Page() {
  const controls = useControls(pinInputControls)

  const [state, send] = useMachine(
    pinInput.machine({
      id: createUniqueId(),
      name: "test",
    }),
    {
      context: controls.context,
    },
  )

  const api = createMemo(() => pinInput.connect(state, send, normalizeProps))

  return (
    <>
      <main>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = serialize(e.currentTarget, { hash: true })
            console.log(formData)
          }}
        >
          <div {...api().rootProps}>
            <input data-testid="input-1" {...api().getInputProps({ index: 0 })} />
            <input data-testid="input-2" {...api().getInputProps({ index: 1 })} />
            <input data-testid="input-3" {...api().getInputProps({ index: 2 })} />
          </div>
          <input {...api().hiddenInputProps} />
          <button data-testid="clear-button" onClick={api().clearValue}>
            Clear
          </button>
        </form>
      </main>

      <Toolbar controls={controls.ui} visualizer={<StateVisualizer state={state} />} />
    </>
  )
}
