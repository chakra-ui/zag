import * as pinInput from "@zag-js/pin-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { pinInputControls } from "@zag-js/shared"
import serialize from "form-serialize"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(pinInputControls)

  const [state, send] = useMachine(
    pinInput.machine({
      name: "test",
      id: useId(),
    }),
    {
      context: controls.context,
    },
  )

  const api = pinInput.connect(state, send, normalizeProps)

  return (
    <>
      <main className="pin-input">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const formData = serialize(e.currentTarget, { hash: true })
            console.log(formData)
          }}
        >
          <label {...api.labelProps}>Enter Pin</label>
          <div {...api.rootProps}>
            <input data-testid="input-1" {...api.getInputProps({ index: 0 })} />
            <input data-testid="input-2" {...api.getInputProps({ index: 1 })} />
            <input data-testid="input-3" {...api.getInputProps({ index: 2 })} />
          </div>
          <input {...api.hiddenInputProps} />
          <button data-testid="clear-button" onClick={api.clearValue}>
            Clear
          </button>
          <button onClick={api.focus}>Focus</button>
        </form>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
