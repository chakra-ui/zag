import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

export default function Page() {
  const [checked, setChecked] = useState(false)

  const service = useMachine(checkbox.machine, {
    id: useId(),
    name: "checkbox",
    checked,
    onCheckedChange(details) {
      setChecked(!!details.checked)
    },
  })

  const api = checkbox.connect(service, normalizeProps)

  return (
    <main className="checkbox">
      <label {...api.getRootProps()}>
        <div {...api.getControlProps()} />
        <span {...api.getLabelProps()}>Input {api.checked ? "Checked" : "Unchecked"}</span>
        <input {...api.getHiddenInputProps()} data-testid="hidden-input" />
        <div {...api.getIndicatorProps()}>Indicator</div>
      </label>

      <button type="button" disabled={api.checked} onClick={() => api.setChecked(true)}>
        Check
      </button>
      <button type="button" disabled={!api.checked} onClick={() => api.setChecked(false)}>
        Uncheck
      </button>
      <button type="reset">Reset Form</button>
    </main>
  )
}
