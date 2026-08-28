import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"

export default function Page() {
  const service = useMachine(field.machine, () => ({
    id: createUniqueId(),
    required: true,
    validationMode: "onBlur" as const,
  }))

  const api = createMemo(() => field.connect(service, normalizeProps))

  return (
    <>
      <main class="field-page">
        <h1>Field — Custom messages</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>
              Website <span {...api().getIndicatorProps({ type: "required" })}>*</span>
            </label>
            <input {...api().getInputProps()} type="url" placeholder="https://example.com" />
            <span {...api().getHelperTextProps()}>Shown on your public profile.</span>
            <span {...api().getErrorTextProps({ match: "valueMissing" })}>Please enter your website URL.</span>
            <span {...api().getErrorTextProps({ match: "typeMismatch" })}>
              Enter a full URL, like https://example.com
            </span>
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
