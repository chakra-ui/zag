import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

export default function Page() {
  const service = useMachine(checkbox.machine, {
    id: useId(),
    name: "uncontrolled",
    defaultChecked: "indeterminate",
  })

  const api = checkbox.connect(service, normalizeProps)

  const [checked, setChecked] = useState<checkbox.CheckedState>("indeterminate")

  const controlledService = useMachine(checkbox.machine, {
    id: useId(),
    name: "controlled",
    checked,
    onCheckedChange(details) {
      setChecked(details.checked)
    },
  })

  const controlledApi = checkbox.connect(controlledService, normalizeProps)

  return (
    <>
      <main className="checkbox">
        <form>
          <fieldset>
            <label {...api.getRootProps()}>
              <div {...api.getControlProps()} />
              <span {...api.getLabelProps()}>Uncontrolled: {String(api.checkedState)}</span>
              <input {...api.getHiddenInputProps()} data-testid="hidden-input" />
            </label>
            <button type="reset">Reset Form</button>
          </fieldset>
        </form>

        <label {...controlledApi.getRootProps()}>
          <div {...controlledApi.getControlProps()} />
          <span {...controlledApi.getLabelProps()}>Controlled: {String(controlledApi.checkedState)}</span>
          <input {...controlledApi.getHiddenInputProps()} data-testid="controlled-hidden-input" />
        </label>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
