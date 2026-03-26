import styles from "../../../../shared/src/css/password-input.module.css"
import * as passwordInput from "@zag-js/password-input"
import { normalizeProps, useMachine } from "@zag-js/react"
import { passwordInputControls } from "@zag-js/shared"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import { useControls } from "../../hooks/use-controls"

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
        <div {...api.getRootProps()} className={styles.Root}>
          <label {...api.getLabelProps()}>Password</label>
          <div {...api.getControlProps()} className={styles.Control}>
            <input {...api.getInputProps()} className={styles.Input} />
            <button {...api.getVisibilityTriggerProps()} className={styles.VisibilityTrigger}>
              <span {...api.getIndicatorProps()} className={styles.Indicator}>{api.visible ? <EyeIcon /> : <EyeOffIcon />}</span>
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
