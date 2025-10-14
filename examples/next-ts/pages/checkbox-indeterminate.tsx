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

  const service = useMachine(checkbox.machine, {
    id: useId(),
    name: "checkbox",
    defaultChecked: "indeterminate",
    ...controls.context,
  })

  const api = checkbox.connect(service, normalizeProps)

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
            <label {...api.getRootProps()}>
              <div {...api.getControlProps()} />
              <span {...api.getLabelProps()}>
                Input {api.indeterminate ? "Indeterminate" : api.checked ? "Checked" : "Unchecked"}
              </span>
              <input {...api.getHiddenInputProps()} data-testid="hidden-input" />
              <div {...api.getIndicatorProps()}>Indicator</div>
            </label>

            <button type="button" disabled={api.checked} onClick={() => api.setChecked(true)}>
              Check
            </button>
            <button type="button" disabled={!api.checked} onClick={() => api.setChecked(false)}>
              Uncheck
            </button>
            <button
              type="button"
              disabled={api.checkedState === "indeterminate"}
              onClick={() => api.setChecked("indeterminate")}
            >
              Indeterminate
            </button>
            <button type="reset">Reset Form</button>
          </fieldset>
        </form>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
