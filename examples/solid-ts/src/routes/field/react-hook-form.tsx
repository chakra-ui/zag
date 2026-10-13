import * as field from "@zag-js/field"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { Show, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/field.css"

interface FormValues {
  username: string
}

// Plain-signal form state: validates on submit, then re-validates on change
function validate(value: string) {
  if (!value) return "Username is required"
  if (value.length < 3) return "Use at least 3 characters"
  return undefined
}

export default function Page() {
  const [submitted, setSubmitted] = createSignal<FormValues | null>(null)
  const [value, setValue] = createSignal("")
  const [error, setError] = createSignal<string>()
  const [touched, setTouched] = createSignal(false)
  const [submitCount, setSubmitCount] = createSignal(0)

  // the form owns validation and interaction flags; the field mirrors them
  const id = createUniqueId()
  const service = useMachine(field.machine, () => ({
    id,
    required: true,
    invalid: !!error(),
    dirty: value() !== "",
    touched: touched(),
  }))

  const api = createMemo(() => field.connect(service, normalizeProps))

  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault()
    setSubmitCount((c) => c + 1)
    const message = validate(value())
    setError(message)
    if (!message) setSubmitted({ username: value() })
  }

  return (
    <main class="field-page">
      <h1>Field — Signals Form</h1>
      <form onSubmit={onSubmit} noValidate>
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>
            Username <span {...api().getIndicatorProps({ type: "required" })}>*</span>
          </label>
          <input
            {...mergeProps(api().getInputProps(), {
              name: "username",
              onInput(event: InputEvent & { currentTarget: HTMLInputElement }) {
                setValue(event.currentTarget.value)
                if (submitCount() > 0) setError(validate(event.currentTarget.value))
              },
              onBlur() {
                setTouched(true)
              },
            })}
            placeholder="e.g. sage"
          />
          <span {...api().getHelperTextProps()}>Managed and validated by plain signals.</span>
          <span {...api().getErrorTextProps()}>{error()}</span>
        </div>
        <Show when={submitted()}>{(data) => <span data-testid="submitted">Submitted: {data().username}</span>}</Show>
        <div class="actions">
          <button type="submit">Submit</button>
        </div>
      </form>
    </main>
  )
}
