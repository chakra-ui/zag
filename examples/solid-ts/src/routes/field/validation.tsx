import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"

const TAKEN_EMAILS = ["taken@example.com"]

const checkEmail = (value: string) => (TAKEN_EMAILS.includes(value) ? "This email is already taken" : null)

export default function Page() {
  const [mode, setMode] = createSignal<field.ValidationMode>("onSubmit")
  const [isAsync, setIsAsync] = createSignal(false)
  const [submitted, setSubmitted] = createSignal(false)

  const service = useMachine(field.machine, () => ({
    id: createUniqueId(),
    required: true,
    validationMode: mode(),
    validate({ value }: field.ValidateDetails) {
      if (!isAsync()) return checkEmail(value)
      return new Promise<field.ValidateResult>((resolve) => setTimeout(() => resolve(checkEmail(value)), 400))
    },
  }))

  const api = createMemo(() => field.connect(service, normalizeProps))

  return (
    <>
      <main class="field-page">
        <h1>Field — Validation</h1>
        <div class="options">
          <label>
            Mode{" "}
            <select value={mode()} onChange={(e) => setMode(e.currentTarget.value as field.ValidationMode)}>
              <option value="onSubmit">onSubmit</option>
              <option value="onBlur">onBlur</option>
              <option value="onChange">onChange</option>
            </select>
          </label>
          <label>
            <input type="checkbox" checked={isAsync()} onChange={(e) => setIsAsync(e.currentTarget.checked)} />
            Async validation
          </label>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSubmitted(true)
          }}
        >
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>
              Email <span {...api().getIndicatorProps({ type: "required" })}>*</span>
            </label>
            <input {...api().getInputProps()} type="email" placeholder="taken@example.com is taken" />
            <span {...api().getHelperTextProps()}>We never share your email.</span>
            <span {...api().getErrorTextProps()}>{api().errors[0]}</span>
            <span {...api().getIndicatorProps({ type: "valid" })}>Looks good</span>
          </div>
          <Show when={api().validating}>
            <span data-testid="validating">Checking…</span>
          </Show>
          <Show when={submitted()}>
            <span data-testid="submitted">Submitted!</span>
          </Show>
          <div class="actions">
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
