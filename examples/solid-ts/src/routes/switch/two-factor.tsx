import { normalizeProps, useMachine } from "@zag-js/solid"
import * as zagSwitch from "@zag-js/switch"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/switch.css"

export default function Page() {
  const id = createUniqueId()
  const [checked, setChecked] = createSignal(false)
  const [submitted, setSubmitted] = createSignal(false)
  const [saved, setSaved] = createSignal(false)

  const invalid = () => submitted() && !checked()
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  const service = useMachine(zagSwitch.machine, () => ({
    id,
    required: true,
    invalid: invalid(),
    onCheckedChange: (details) => {
      setChecked(details.checked)
      setSaved(false)
    },
  }))

  const api = createMemo(() => zagSwitch.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="switch-two-factor">
          <p class="hint">Save with it off to see the error.</p>
          <form
            novalidate
            onSubmit={(e) => {
              e.preventDefault()
              setSubmitted(true)
              setSaved(checked())
            }}
          >
            <div class="field">
              <label data-testid="switch-two-factor" {...api().getRootProps()}>
                <input
                  {...api().getHiddenInputProps()}
                  aria-describedby={invalid() ? `${descriptionId} ${errorId}` : descriptionId}
                />
                <span {...api().getControlProps()}>
                  <span {...api().getThumbProps()} />
                </span>
                <span {...api().getLabelProps()}>Two-factor authentication</span>
              </label>
              <p class="description" id={descriptionId}>
                Ask for a 6-digit code from your authenticator app when you sign in.
              </p>
              <Show when={invalid()}>
                <p class="error" id={errorId} role="alert">
                  Turn on two-factor authentication to continue.
                </p>
              </Show>
            </div>
            <div class="actions">
              <button type="submit">Save security settings</button>
            </div>
          </form>
          <Show when={saved()}>
            <p class="status" role="status">
              Two-factor authentication is on.
            </p>
          </Show>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
