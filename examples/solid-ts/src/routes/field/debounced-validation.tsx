import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"

const TAKEN_EMAILS = ["taken@example.com"]

const checkEmail = (value: string) => (TAKEN_EMAILS.includes(value) ? "This email is already taken" : null)

export default function Page() {
  const [calls, setCalls] = createSignal(0)
  let timer: ReturnType<typeof setTimeout> | undefined

  const service = useMachine(field.machine, () => ({
    id: createUniqueId(),
    required: true,
    validationMode: "onChange",
    // Debounce by returning a promise and resetting the timer. The machine drops stale resolutions.
    validate({ value }: field.ValidateDetails) {
      return new Promise<field.ValidateResult>((resolve) => {
        clearTimeout(timer)
        timer = setTimeout(() => {
          setCalls((n) => n + 1)
          resolve(checkEmail(value))
        }, 400)
      })
    },
  }))

  const api = createMemo(() => field.connect(service, normalizeProps))

  return (
    <>
      <main class="field-page">
        <h1>Field — Debounced Validation</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>
              Email <span {...api().getIndicatorProps({ type: "required" })}>*</span>
            </label>
            <input {...api().getInputProps()} placeholder="taken@example.com is taken" />
            <span {...api().getHelperTextProps()}>Validation runs 400ms after you stop typing.</span>
            <span {...api().getErrorTextProps()}>{api().errors[0]}</span>
            <span {...api().getIndicatorProps({ type: "valid" })}>Looks good</span>
          </div>
          <Show when={api().validating}>
            <span data-testid="validating">Checking…</span>
          </Show>
          <span data-testid="validate-calls">Checks: {calls()}</span>
          <div class="actions">
            <button type="submit">Submit</button>
            <button
              type="reset"
              onClick={() => {
                clearTimeout(timer)
                setCalls(0)
              }}
            >
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
