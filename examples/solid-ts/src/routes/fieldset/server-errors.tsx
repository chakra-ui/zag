import * as field from "@zag-js/field"
import * as fieldset from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
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

export default function Page() {
  const [errors, setErrors] = createSignal<Errors>({})
  const [pending, setPending] = createSignal(false)
  const [created, setCreated] = createSignal("")

  const fieldsetId = createUniqueId()
  const emailId = createUniqueId()
  const usernameId = createUniqueId()

  const hasErrors = () => Object.keys(errors()).length > 0

  const fieldsetService = useMachine(fieldset.machine, () => ({ id: fieldsetId, invalid: hasErrors() }))
  const fieldsetApi = createMemo(() => fieldset.connect(fieldsetService, normalizeProps))

  const emailService = useMachine(field.machine, () => ({ id: emailId, invalid: !!errors().email }))
  const emailApi = createMemo(() => field.connect(emailService, normalizeProps))

  const usernameService = useMachine(field.machine, () => ({ id: usernameId, invalid: !!errors().username }))
  const usernameApi = createMemo(() => field.connect(usernameService, normalizeProps))

  return (
    <>
      <main>
        <div class="field-page server-errors">
          <h1>Fieldset — Server errors</h1>
          <p class="hint">
            Submit the empty form, or pick the username "lope". The server check marks the fieldset and the fields
            invalid.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const data = new FormData(e.currentTarget)
              const email = String(data.get("email") ?? "").trim()
              const username = String(data.get("username") ?? "").trim()
              setPending(true)
              setCreated("")
              setErrors({})
              const result = await validate(email, username)
              setPending(false)
              setErrors(result)
              if (!Object.keys(result).length) setCreated(`Account created for ${username}`)
            }}
            onReset={() => {
              setErrors({})
              setCreated("")
            }}
          >
            <fieldset {...fieldsetApi().getRootProps()}>
              <legend {...fieldsetApi().getLegendProps()}>Create your account</legend>
              <span {...fieldsetApi().getHelperTextProps()}>We will email you a confirmation link.</span>
              <div {...emailApi().getRootProps()}>
                <label {...emailApi().getLabelProps()}>Email</label>
                <input {...emailApi().getInputProps()} name="email" type="email" placeholder="ada@example.com" />
                <span {...emailApi().getErrorTextProps()}>{errors().email}</span>
              </div>
              <div {...usernameApi().getRootProps()}>
                <label {...usernameApi().getLabelProps()}>Username</label>
                <input {...usernameApi().getInputProps()} name="username" placeholder="ada" />
                <span {...usernameApi().getErrorTextProps()}>{errors().username}</span>
              </div>
              <span {...fieldsetApi().getErrorTextProps()}>Fix the highlighted fields to continue</span>
            </fieldset>
            <div class="actions">
              <button type="submit" disabled={pending()}>
                Create account
              </button>
              <button type="reset">Reset</button>
            </div>
          </form>
          <p class="output" role="status" data-testid="status">
            {pending() ? <span class="pending">Checking with the server…</span> : null}
            {created() ? <span class="success">{created()}</span> : null}
          </p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={fieldsetService} />
        <StateVisualizer state={emailService} />
        <StateVisualizer state={usernameService} />
      </Toolbar>
    </>
  )
}
