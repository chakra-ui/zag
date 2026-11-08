import { normalizeProps, useMachine } from "@zag-js/preact"
import * as zagSwitch from "@zag-js/switch"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/switch.css"

export default function Page() {
  const id = useId()
  const [checked, setChecked] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [saved, setSaved] = useState(false)

  const invalid = submitted && !checked
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  const service = useMachine(zagSwitch.machine, {
    id,
    required: true,
    invalid,
    onCheckedChange: (details) => {
      setChecked(details.checked)
      setSaved(false)
    },
  })

  const api = zagSwitch.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="switch-two-factor">
          <p className="hint">Save with it off to see the error.</p>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted(true)
              setSaved(checked)
            }}
          >
            <div className="field">
              <label data-testid="switch-two-factor" {...api.getRootProps()}>
                <input
                  {...api.getHiddenInputProps()}
                  aria-describedby={invalid ? `${descriptionId} ${errorId}` : descriptionId}
                />
                <span {...api.getControlProps()}>
                  <span {...api.getThumbProps()} />
                </span>
                <span {...api.getLabelProps()}>Two-factor authentication</span>
              </label>
              <p className="description" id={descriptionId}>
                Ask for a 6-digit code from your authenticator app when you sign in.
              </p>
              {invalid && (
                <p className="error" id={errorId} role="alert">
                  Turn on two-factor authentication to continue.
                </p>
              )}
            </div>
            <div className="actions">
              <button type="submit">Save security settings</button>
            </div>
          </form>
          {saved && (
            <p className="status" role="status">
              Two-factor authentication is on.
            </p>
          )}
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
