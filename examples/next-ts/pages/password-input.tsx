import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { passwordInputControls } from "@zag-js/shared"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(passwordInputControls)
  const service = useMachine(passwordInput.machine, {
    id: useId(),
    ...controls.context,
  })

  const api = passwordInput.connect(service, normalizeProps)

  return (
    <>
      <main className="password-input">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Password</label>
          <div {...api.getControlProps()}>
            <input {...api.getInputProps()} />
            <button {...api.getVisibilityTriggerProps()}>
              <span {...api.getIndicatorProps()}>{api.visible ? <EyeIcon /> : <EyeOffIcon />}</span>
            </button>
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
