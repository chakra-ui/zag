import * as checkbox from "@zag-js/checkbox"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { checkboxControls } from "@zag-js/shared"
import serialize from "form-serialize"
import { useId, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(checkboxControls)

  const [state, send] = useMachine(
    checkbox.machine({
      id: useId(),
    }),
    {
      context: controls.context,
    },
  )

  const api = checkbox.connect(state, send, normalizeProps)

  const inputProps = mergeProps(api.inputProps, {
    onChange() {
      if (api.isIndeterminate && !api.isReadOnly) {
        api.setIndeterminate(false)
        api.setChecked(true)
      }
    },
  })

  const [disabled, setDisabled] = useState(true)

  return (
    <>
      <main className="checkbox">
        <button
          onClick={() => {
            setDisabled((prev) => !prev)
          }}
        >
          Switch {disabled ? "enable" : "disable"}
        </button>
        <form
          onChange={(e) => {
            console.log(serialize(e.currentTarget, { hash: true }))
          }}
        >
          <fieldset disabled={disabled}>
            <label {...api.rootProps}>
              <span {...api.labelProps}>Input {api.isChecked ? "Checked" : "Unchecked"}</span>
              <input {...inputProps} />
              <div {...api.controlProps} />
            </label>

            <button type="button" disabled={api.isChecked} onClick={() => api.setChecked(true)}>
              Check
            </button>
            <button type="button" disabled={!api.isChecked} onClick={() => api.setChecked(false)}>
              UnCheck
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
