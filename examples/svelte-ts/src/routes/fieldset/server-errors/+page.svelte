<script lang="ts">
  import * as field from "@zag-js/field"
  import * as fieldsetMachine from "@zag-js/fieldset"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import Toolbar from "#lib/components/toolbar.svelte"
  import StateVisualizer from "#lib/components/state-visualizer.svelte"
  import "@styles/field.css"
  import "@styles/fieldset.css"

  type Errors = { email?: string; username?: string }

  const takenUsernames = ["admin", "lope"]

  // stands in for a round trip to the server
  function validate(email: string, username: string): Promise<Errors> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const errors: Errors = {}
        if (!email) errors.email = "Enter your email address"
        if (!username) errors.username = "Choose a username"
        else if (takenUsernames.includes(username.toLowerCase())) errors.username = "That username is already taken"
        resolve(errors)
      }, 200)
    })
  }

  let errors = $state<Errors>({})
  let pending = $state(false)
  let created = $state("")

  const id = $props.id()
  const fieldsetService = useMachine(fieldsetMachine.machine, () => ({
    id,
    invalid: Object.keys(errors).length > 0,
  }))
  const fieldsetApi = $derived(fieldsetMachine.connect(fieldsetService, normalizeProps))

  const emailService = useMachine(field.machine, () => ({ id: `${id}-email`, invalid: !!errors.email }))
  const emailApi = $derived(field.connect(emailService, normalizeProps))

  const usernameService = useMachine(field.machine, () => ({ id: `${id}-username`, invalid: !!errors.username }))
  const usernameApi = $derived(field.connect(usernameService, normalizeProps))

  async function onsubmit(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const email = String(data.get("email") ?? "").trim()
    const username = String(data.get("username") ?? "").trim()
    pending = true
    created = ""
    errors = {}
    const result = await validate(email, username)
    pending = false
    errors = result
    if (!Object.keys(result).length) created = `Account created for ${username}`
  }
</script>

<main>
  <div class="field-page server-errors">
    <h1>Fieldset — Server errors</h1>
    <p class="hint">
      Submit the empty form, or pick the username "lope". The server check marks the fieldset and the fields invalid.
    </p>
    <form
      {onsubmit}
      onreset={() => {
        errors = {}
        created = ""
      }}
    >
      <fieldset {...fieldsetApi.getRootProps()}>
        <legend {...fieldsetApi.getLegendProps()}>Create your account</legend>
        <span {...fieldsetApi.getHelperTextProps()}>We will email you a confirmation link.</span>
        <div {...emailApi.getRootProps()}>
          <label {...emailApi.getLabelProps()}>Email</label>
          <input {...emailApi.getInputProps()} name="email" type="email" placeholder="ada@example.com" />
          <span {...emailApi.getErrorTextProps()}>{errors.email}</span>
        </div>
        <div {...usernameApi.getRootProps()}>
          <label {...usernameApi.getLabelProps()}>Username</label>
          <input {...usernameApi.getInputProps()} name="username" placeholder="ada" />
          <span {...usernameApi.getErrorTextProps()}>{errors.username}</span>
        </div>
        <span {...fieldsetApi.getErrorTextProps()}>Fix the highlighted fields to continue</span>
      </fieldset>
      <div class="actions">
        <button type="submit" disabled={pending}>Create account</button>
        <button type="reset">Reset</button>
      </div>
    </form>
    <p class="output" role="status" data-testid="status">
      {#if pending}<span class="pending">Checking with the server…</span>{/if}
      {#if created}<span class="success">{created}</span>{/if}
    </p>
  </div>
</main>

<Toolbar viz>
  <StateVisualizer state={fieldsetService} />
  <StateVisualizer state={emailService} />
  <StateVisualizer state={usernameService} />
</Toolbar>
