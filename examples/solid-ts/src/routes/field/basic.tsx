import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"

export default function Page() {
  const [disabled, setDisabled] = createSignal(false)
  const [invalid, setInvalid] = createSignal(false)
  const [required, setRequired] = createSignal(true)

  const service = useMachine(field.machine, () => ({
    id: createUniqueId(),
    disabled: disabled(),
    invalid: invalid(),
    required: required(),
  }))

  const api = createMemo(() => field.connect(service, normalizeProps))

  return (
    <>
      <main class="field-page">
        <h1>Field — Basic</h1>
        <div class="options">
          <label>
            <input type="checkbox" checked={disabled()} onChange={(e) => setDisabled(e.currentTarget.checked)} />
            Disabled
          </label>
          <label>
            <input type="checkbox" checked={invalid()} onChange={(e) => setInvalid(e.currentTarget.checked)} />
            Invalid
          </label>
          <label>
            <input type="checkbox" checked={required()} onChange={(e) => setRequired(e.currentTarget.checked)} />
            Required
          </label>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>
              Username <span {...api().getIndicatorProps({ type: "required" })}>*</span>
            </label>
            <input {...api().getInputProps()} placeholder="e.g. sage" />
            <span {...api().getHelperTextProps()}>Choose a short, memorable name.</span>
            <span {...api().getErrorTextProps()}>{api().errors[0] ?? "Field is invalid"}</span>
          </div>
          <div class="actions">
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
          </div>
        </form>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
