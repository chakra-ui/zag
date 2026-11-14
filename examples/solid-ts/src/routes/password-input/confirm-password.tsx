import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { EyeIcon, EyeOffIcon } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, Show } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/password-input.css"

export default function Page() {
  const [visible, setVisible] = createSignal(false)
  const [password, setPassword] = createSignal("")
  const [confirm, setConfirm] = createSignal("")

  const bothFilled = () => password().length > 0 && confirm().length > 0
  const matches = () => password() === confirm()
  const status = () =>
    !bothFilled() ? "Enter both passwords" : matches() ? "Passwords match" : "Passwords don't match"

  const passwordService = useMachine(passwordInput.machine, () => ({
    id: createUniqueId(),
    autoComplete: "new-password" as const,
    visible: visible(),
    onVisibilityChange: (details: { visible: boolean }) => setVisible(details.visible),
  }))
  const passwordApi = createMemo(() => passwordInput.connect(passwordService, normalizeProps))

  const confirmService = useMachine(passwordInput.machine, () => ({
    id: createUniqueId(),
    autoComplete: "new-password" as const,
    visible: visible(),
    onVisibilityChange: (details: { visible: boolean }) => setVisible(details.visible),
    invalid: bothFilled() && !matches(),
    translations: { visibilityTrigger: (v: boolean) => (v ? "Hide confirmation" : "Show confirmation") },
  }))
  const confirmApi = createMemo(() => passwordInput.connect(confirmService, normalizeProps))

  return (
    <>
      <main>
        <div class="password-confirm">
          <p class="hint">Show either password and both fields reveal together.</p>
          <div {...passwordApi().getRootProps()}>
            <label {...passwordApi().getLabelProps()}>New password</label>
            <div {...passwordApi().getControlProps()}>
              <input {...passwordApi().getInputProps()} onInput={(e) => setPassword(e.currentTarget.value)} />
              <button {...passwordApi().getVisibilityTriggerProps()}>
                <span {...passwordApi().getIndicatorProps()}>
                  <Show when={passwordApi().visible} fallback={<EyeOffIcon />}>
                    <EyeIcon />
                  </Show>
                </span>
              </button>
            </div>
          </div>
          <div {...confirmApi().getRootProps()}>
            <label {...confirmApi().getLabelProps()}>Confirm password</label>
            <div {...confirmApi().getControlProps()}>
              <input {...confirmApi().getInputProps()} onInput={(e) => setConfirm(e.currentTarget.value)} />
              <button {...confirmApi().getVisibilityTriggerProps()}>
                <span {...confirmApi().getIndicatorProps()}>
                  <Show when={confirmApi().visible} fallback={<EyeOffIcon />}>
                    <EyeIcon />
                  </Show>
                </span>
              </button>
            </div>
          </div>
          <p class="match" role="status">
            {status()}
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
