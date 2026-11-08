import * as field from "@zag-js/field"
import * as fieldset from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useEffect, useId, useRef, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/field.css"
import "@styles/fieldset.css"

type Errors = { email?: string; username?: string }

const takenUsernames = ["admin", "lope"]

// stands in for a round trip to the server
function check(email: string, username: string): Errors {
  const errors: Errors = {}
  if (!email) errors.email = "Enter your email address"
  if (!username) errors.username = "Choose a username"
  else if (takenUsernames.includes(username.toLowerCase())) errors.username = "That username is already taken"
  return errors
}

export default function Page() {
  const [errors, setErrors] = useState<Errors>({})
  const [pending, setPending] = useState(false)
  const [created, setCreated] = useState("")

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const requestId = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  const hasErrors = Object.keys(errors).length > 0

  const fieldsetService = useMachine(fieldset.machine, { id: useId(), invalid: hasErrors })
  const fieldsetApi = fieldset.connect(fieldsetService, normalizeProps)

  const emailService = useMachine(field.machine, { id: useId(), invalid: !!errors.email })
  const emailApi = field.connect(emailService, normalizeProps)

  const usernameService = useMachine(field.machine, { id: useId(), invalid: !!errors.username })
  const usernameApi = field.connect(usernameService, normalizeProps)

  return (
    <>
      <main>
        <div className="field-page server-errors">
          <p className="hint">Submit empty, or use the username "lope", to see server errors.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const data = new FormData(e.currentTarget)
              const email = String(data.get("email") ?? "").trim()
              const username = String(data.get("username") ?? "").trim()
              const id = ++requestId.current
              clearTimeout(timer.current)
              setPending(true)
              setCreated("")
              setErrors({})
              timer.current = setTimeout(() => {
                // a Reset (or a newer submit) makes this result stale
                if (id !== requestId.current) return
                const result = check(email, username)
                setPending(false)
                setErrors(result)
                if (!Object.keys(result).length) setCreated(`Account created for ${username}`)
              }, 200)
            }}
            onReset={() => {
              requestId.current++
              clearTimeout(timer.current)
              setPending(false)
              setErrors({})
              setCreated("")
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
            <div className="actions">
              <button type="submit" disabled={pending}>
                Create account
              </button>
              <button type="reset">Reset</button>
            </div>
          </form>
          <p className="output" role="status" data-testid="status">
            {pending ? <span className="pending">Checking with the server…</span> : null}
            {created ? <span className="success">{created}</span> : null}
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
