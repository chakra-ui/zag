import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId, useState } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"

const TAKEN_EMAILS = ["taken@example.com"]

const checkEmail = (value: string) => (TAKEN_EMAILS.includes(value) ? "This email is already taken" : null)

export default function Page() {
  const [mode, setMode] = useState<field.ValidationMode>("onSubmit")
  const [async, setAsync] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const service = useMachine(field.machine, {
    id: useId(),
    required: true,
    validationMode: mode,
    validate({ value }) {
      if (!async) return checkEmail(value)
      return new Promise((resolve) => setTimeout(() => resolve(checkEmail(value)), 400))
    },
  })

  const api = field.connect(service, normalizeProps)

  return (
    <>
      <main className="field-page">
        <h1>Field — Validation</h1>
        <div className="options">
          <label>
            Mode{" "}
            <select value={mode} onChange={(e) => setMode(e.currentTarget.value as field.ValidationMode)}>
              <option value="onSubmit">onSubmit</option>
              <option value="onBlur">onBlur</option>
              <option value="onChange">onChange</option>
            </select>
          </label>
          <label>
            <input type="checkbox" checked={async} onChange={(e) => setAsync(e.currentTarget.checked)} />
            Async validation
          </label>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted(true)
          }}
        >
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>
              Email <span {...api.getIndicatorProps({ type: "required" })}>*</span>
            </label>
            <input {...api.getInputProps()} type="email" placeholder="taken@example.com is taken" />
            <span {...api.getHelperTextProps()}>We never share your email.</span>
            <span {...api.getErrorTextProps()}>{api.errors[0]}</span>
            <span {...api.getIndicatorProps({ type: "valid" })}>Looks good</span>
          </div>
          {api.validating && <span data-testid="validating">Checking…</span>}
          {submitted && <span data-testid="submitted">Submitted!</span>}
          <div className="actions">
            <button type="submit">Submit</button>
            <button type="reset" onClick={() => setSubmitted(false)}>
              Reset
            </button>
          </div>
        </form>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
