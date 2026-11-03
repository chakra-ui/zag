import { useForm, type AnyFieldApi } from "@tanstack/preact-form"
import * as field from "@zag-js/field"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/preact"
import { useId, useState } from "preact/hooks"
import "@styles/field.css"

interface FormValues {
  username: string
}

function validateUsername({ value }: { value: string }) {
  if (!value) return "Username is required"
  if (value.length < 3) return "Use at least 3 characters"
  return undefined
}

function UsernameField({ fieldApi }: { fieldApi: AnyFieldApi }) {
  const { meta, value } = fieldApi.state

  // the library owns validation and interaction flags; the field mirrors them
  const service = useMachine(field.machine, {
    id: useId(),
    required: true,
    invalid: meta.isTouched && !meta.isValid,
    dirty: meta.isDirty,
    touched: meta.isTouched,
  })

  const api = field.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>
        Username <span {...api.getIndicatorProps({ type: "required" })}>*</span>
      </label>
      <input
        {...mergeProps(api.getInputProps(), {
          name: fieldApi.name,
          value,
          onInput: (event: Event) => fieldApi.handleChange((event.currentTarget as HTMLInputElement).value),
          onBlur: fieldApi.handleBlur,
        })}
        placeholder="e.g. sage"
      />
      <span {...api.getHelperTextProps()}>Managed and validated by TanStack Form.</span>
      <span {...api.getErrorTextProps()}>{meta.errors[0]}</span>
    </div>
  )
}

export default function Page() {
  const [submitted, setSubmitted] = useState<FormValues | null>(null)

  const form = useForm({
    defaultValues: { username: "" } as FormValues,
    onSubmit: ({ value }) => setSubmitted(value),
  })

  return (
    <main className="field-page">
      <h1>Field — TanStack Form</h1>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          form.handleSubmit()
        }}
      >
        <form.Field name="username" validators={{ onChange: validateUsername }}>
          {(fieldApi) => <UsernameField fieldApi={fieldApi} />}
        </form.Field>
        {submitted && <span data-testid="submitted">Submitted: {submitted.username}</span>}
        <div className="actions">
          <button type="submit">Submit</button>
        </div>
      </form>
    </main>
  )
}
