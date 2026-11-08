import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { EyeIcon, EyeOffIcon } from "lucide-preact"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/password-input.css"

export default function Page() {
  const [visible, setVisible] = useState(false)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

  const bothFilled = password.length > 0 && confirm.length > 0
  const matches = password === confirm
  const status = !bothFilled ? "Enter both passwords" : matches ? "Passwords match" : "Passwords don't match"

  const passwordService = useMachine(passwordInput.machine, {
    id: useId(),
    autoComplete: "new-password",
    visible,
    onVisibilityChange: (details) => setVisible(details.visible),
  })
  const passwordApi = passwordInput.connect(passwordService, normalizeProps)

  const confirmService = useMachine(passwordInput.machine, {
    id: useId(),
    autoComplete: "new-password",
    visible,
    onVisibilityChange: (details) => setVisible(details.visible),
    invalid: bothFilled && !matches,
    translations: { visibilityTrigger: (visible) => (visible ? "Hide confirmation" : "Show confirmation") },
  })
  const confirmApi = passwordInput.connect(confirmService, normalizeProps)

  return (
    <>
      <main>
        <div className="password-confirm">
          <p className="hint">Show either password and both fields reveal together.</p>
          <div {...passwordApi.getRootProps()}>
            <label {...passwordApi.getLabelProps()}>New password</label>
            <div {...passwordApi.getControlProps()}>
              <input {...passwordApi.getInputProps()} onInput={(e) => setPassword(e.currentTarget.value)} />
              <button {...passwordApi.getVisibilityTriggerProps()}>
                <span {...passwordApi.getIndicatorProps()}>{passwordApi.visible ? <EyeIcon /> : <EyeOffIcon />}</span>
              </button>
            </div>
          </div>
          <div {...confirmApi.getRootProps()}>
            <label {...confirmApi.getLabelProps()}>Confirm password</label>
            <div {...confirmApi.getControlProps()}>
              <input {...confirmApi.getInputProps()} onInput={(e) => setConfirm(e.currentTarget.value)} />
              <button {...confirmApi.getVisibilityTriggerProps()}>
                <span {...confirmApi.getIndicatorProps()}>{confirmApi.visible ? <EyeIcon /> : <EyeOffIcon />}</span>
              </button>
            </div>
          </div>
          <p className="match" role="status">
            {status}
          </p>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={passwordService} />
        <StateVisualizer state={confirmService} />
      </Toolbar>
    </>
  )
}
