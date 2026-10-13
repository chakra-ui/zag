import * as checkbox from "@zag-js/checkbox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/checkbox.css"

export default function Page() {
  const [checked, setChecked] = createSignal(false)

  const id = createUniqueId()
  const service = useMachine(checkbox.machine, () => ({
    id,
    name: "checkbox",
    checked: checked(),
    onCheckedChange(details) {
      setChecked(!!details.checked)
    },
  }))

  const api = createMemo(() => checkbox.connect(service, normalizeProps))

  return (
    <main class="checkbox">
      <label {...api().getRootProps()}>
        <div {...api().getControlProps()} />
        <span {...api().getLabelProps()}>Input {api().checked ? "Checked" : "Unchecked"}</span>
        <input {...api().getHiddenInputProps()} data-testid="hidden-input" />
        <div {...api().getIndicatorProps()}>Indicator</div>
      </label>

      <button type="button" disabled={api().checked} onClick={() => api().setChecked(true)}>
        Check
      </button>
      <button type="button" disabled={!api().checked} onClick={() => api().setChecked(false)}>
        Uncheck
      </button>
      <button type="reset">Reset Form</button>
    </main>
  )
}
