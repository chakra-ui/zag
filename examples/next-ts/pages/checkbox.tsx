import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { checkboxControls } from "@zag-js/shared"
import serialize from "form-serialize"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(checkboxControls)

  const [state, send] = useMachine(
    checkbox.machine({
      id: useId(),
      name: "checkbox",
    }),
    {
      context: controls.context,
    },
  )

  const api = checkbox.connect(state, send, normalizeProps)

  return (
    <>
      <main className="checkbox">
        <form
          onChange={(e) => {
            const result = serialize(e.currentTarget, { hash: true })
            console.log(result)
          }}
        >
          <fieldset>
            <label {...api.rootProps}>
              <div {...api.controlProps} />
              <span {...api.labelProps}>Input {api.isChecked ? "Checked" : "Unchecked"}</span>
              <input {...api.inputProps} />
            </label>

            <button type="button" disabled={api.isChecked} onClick={() => api.setChecked(true)}>
              Check
            </button>
            <button type="button" disabled={!api.isChecked} onClick={() => api.setChecked(false)}>
              Uncheck
            </button>
            <button type="reset">Reset Form</button>
          </fieldset>
        </form>
      </main>
      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
