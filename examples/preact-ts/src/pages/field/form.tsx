import * as field from "@zag-js/field"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId, useState } from "preact/hooks"
import "@styles/field.css"

const submitToServer = (email: string) =>
  new Promise<Record<string, string>>((resolve) =>
    setTimeout(() => resolve(email === "taken@example.com" ? { email: "This email is already taken" } : {}), 300),
  )

export default function Page() {
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState("")

  const emailService = useMachine(field.machine, { id: useId(), required: true, errors: serverErrors.email })
  const email = field.connect(emailService, normalizeProps)

  const passwordService = useMachine(field.machine, { id: useId(), required: true })
  const password = field.connect(passwordService, normalizeProps)

  const confirmService = useMachine(field.machine, {
    id: useId(),
    required: true,
    validate: ({ value, formValues }) => (value !== formValues.password ? "Passwords don't match" : null),
  })
  const confirm = field.connect(confirmService, normalizeProps)

  return (
    <main className="field-page">
      <form
        onSubmit={async (event) => {
          event.preventDefault()
          setServerErrors({})
          setStatus("Submitting…")
          const errors = await submitToServer(String(new FormData(event.currentTarget).get("email")))
          setServerErrors(errors)
          setStatus(Object.keys(errors).length > 0 ? "" : "Submitted!")
        }}
      >
        <div {...email.getRootProps()}>
          <label {...email.getLabelProps()}>Email</label>
          <input {...email.getInputProps()} name="email" type="email" placeholder="taken@example.com is taken" />
          <span {...email.getErrorTextProps()}>{email.errors[0]}</span>
        </div>

        <div {...password.getRootProps()}>
          <label {...password.getLabelProps()}>Password</label>
          <input {...password.getInputProps()} name="password" type="password" minLength={8} />
          <span {...password.getHelperTextProps()}>At least 8 characters.</span>
          <span {...password.getErrorTextProps()}>{password.errors[0]}</span>
        </div>

        <div {...confirm.getRootProps()}>
          <label {...confirm.getLabelProps()}>Confirm password</label>
          <input {...confirm.getInputProps()} name="confirm" type="password" />
          <span {...confirm.getErrorTextProps()}>{confirm.errors[0]}</span>
        </div>

        <div className="actions">
          <button type="submit">Create account</button>
        </div>
        <output data-testid="status">{status}</output>
      </form>
    </main>
  )
}
