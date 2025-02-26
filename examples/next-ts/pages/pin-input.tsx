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

  const service = useMachine(pinInput.machine, {
    name: "test",
    id: useId(),
    count: 3,
    ...controls.context,
  })

  const api = pinInput.connect(service, normalizeProps)

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
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Enter code:</label>
            <div {...api.getControlProps()}>
              {api.items.map((index) => (
                <input key={index} data-testid={`input-${index + 1}`} {...api.getInputProps({ index })} />
              ))}
            </div>
            <input {...api.getHiddenInputProps()} />
          </div>
          <button data-testid="clear-button" onClick={api.clearValue}>
            Clear
          </button>
          <button onClick={api.focus}>Focus</button>
        </form>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
