import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"

export default function Page() {
  const service = useMachine(field.machine, {
    id: useId(),
    required: true,
    validationMode: "onBlur",
  })

  const api = field.connect(service, normalizeProps)

  return (
    <>
      <main className="field-page">
        <h1>Field — Custom messages</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>
              Website <span {...api.getIndicatorProps({ type: "required" })}>*</span>
            </label>
            <input {...api.getInputProps()} type="url" placeholder="https://example.com" />
            <span {...api.getHelperTextProps()}>Shown on your public profile.</span>
            <span {...api.getErrorTextProps({ match: "valueMissing" })}>Please enter your website URL.</span>
            <span {...api.getErrorTextProps({ match: "typeMismatch" })}>
              Enter a full URL, like https://example.com
            </span>
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
