import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { EyeIcon, EyeOffIcon } from "lucide-preact"
import { useId, useState } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/password-input.css"

export default function Page() {
  const [value, setValue] = useState("")

  const rules = [
    { id: "length", label: "At least 8 characters", met: value.length >= 8 },
    { id: "number", label: "Contains a number", met: /\d/.test(value) },
  ]
  const invalid = value.length > 0 && rules.some((rule) => !rule.met)

  const service = useMachine(passwordInput.machine, {
    id: useId(),
    autoComplete: "new-password",
    invalid,
  })

  const api = passwordInput.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="password-sign-up">
          <p className="hint">Type a password to see which rules it still needs to meet.</p>
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Password</label>
            <div {...api.getControlProps()}>
              <input {...api.getInputProps()} onInput={(e) => setValue(e.currentTarget.value)} />
              <button {...api.getVisibilityTriggerProps()}>
                <span {...api.getIndicatorProps()}>{api.visible ? <EyeIcon /> : <EyeOffIcon />}</span>
              </button>
            </div>
          </div>
          <ul className="rules">
            {rules.map((rule) => (
              <li key={rule.id} data-testid={`rule-${rule.id}`} data-met={rule.met}>
                {rule.label} ({rule.met ? "met" : "not met"})
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
