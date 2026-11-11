<script lang="ts">
  import * as field from "@zag-js/field"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import "@styles/field.css"

  const submitToServer = (email: string) =>
    new Promise<Record<string, string>>((resolve) =>
      setTimeout(() => resolve(email === "taken@example.com" ? { email: "This email is already taken" } : {}), 300),
    )

  let serverErrors = $state<Record<string, string>>({})
  let status = $state("")

  const id = $props.id()

  const emailService = useMachine(field.machine, () => ({
    id: `${id}-email`,
    required: true,
    errors: serverErrors.email,
  }))
  const email = $derived(field.connect(emailService, normalizeProps))

  const passwordService = useMachine(field.machine, { id: `${id}-password`, required: true })
  const password = $derived(field.connect(passwordService, normalizeProps))

  const confirmService = useMachine(field.machine, {
    id: `${id}-confirm`,
    required: true,
    validate: ({ value, formValues }: field.ValidateDetails) =>
      value !== formValues.password ? "Passwords don't match" : null,
  })
  const confirm = $derived(field.connect(confirmService, normalizeProps))

  async function onsubmit(event: SubmitEvent) {
    event.preventDefault()
    const form = event.currentTarget as HTMLFormElement
    serverErrors = {}
    status = "Submitting…"
    const errors = await submitToServer(String(new FormData(form).get("email")))
    serverErrors = errors
    status = Object.keys(errors).length > 0 ? "" : "Submitted!"
  }
</script>

<main class="field-page">
  <form {onsubmit}>
    <div {...email.getRootProps()}>
      <label {...email.getLabelProps()}>Email</label>
      <input {...email.getInputProps()} name="email" type="email" placeholder="taken@example.com is taken" />
      <span {...email.getErrorTextProps()}>{email.errors[0]}</span>
    </div>

    <div {...password.getRootProps()}>
      <label {...password.getLabelProps()}>Password</label>
      <input {...password.getInputProps()} name="password" type="password" minlength="8" />
      <span {...password.getHelperTextProps()}>At least 8 characters.</span>
      <span {...password.getErrorTextProps()}>{password.errors[0]}</span>
    </div>

    <div {...confirm.getRootProps()}>
      <label {...confirm.getLabelProps()}>Confirm password</label>
      <input {...confirm.getInputProps()} name="confirm" type="password" />
      <span {...confirm.getErrorTextProps()}>{confirm.errors[0]}</span>
    </div>

    <div class="actions">
      <button type="submit">Create account</button>
    </div>
    <output data-testid="status">{status}</output>
  </form>
</main>
