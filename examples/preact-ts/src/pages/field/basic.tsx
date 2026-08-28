import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"

export default function Page() {
  const [disabled, setDisabled] = useState(false)
  const [invalid, setInvalid] = useState(false)
  const [required, setRequired] = useState(true)

  const service = useMachine(field.machine, {
    id: useId(),
    disabled,
    invalid,
    required,
  })

  const api = field.connect(service, normalizeProps)

  return (
    <>
      <main className="field-page">
        <h1>Field — Basic</h1>
        <div className="options">
          <label>
            <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.currentTarget.checked)} />
            Disabled
          </label>
          <label>
            <input type="checkbox" checked={invalid} onChange={(e) => setInvalid(e.currentTarget.checked)} />
            Invalid
          </label>
          <label>
            <input type="checkbox" checked={required} onChange={(e) => setRequired(e.currentTarget.checked)} />
            Required
          </label>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>
              Username <span {...api.getIndicatorProps({ type: "required" })}>*</span>
            </label>
            <input {...api.getInputProps()} placeholder="e.g. sage" />
            <span {...api.getHelperTextProps()}>Choose a short, memorable name.</span>
            <span {...api.getErrorTextProps()}>{api.errors[0] ?? "Field is invalid"}</span>
          </div>
          <div className="actions">
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
