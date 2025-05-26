import * as passwordInput from "@zag-js/password-input"
import { passwordInputControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { EyeIcon, EyeOffIcon } from "lucide-solid"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(passwordInputControls)

  const service = useMachine(
    passwordInput.machine,
    controls.mergeProps({
      id: createUniqueId(),
    }),
  )

  const api = createMemo(() => passwordInput.connect(service, normalizeProps))

  return (
    <>
      <main class="password-input">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Password</label>
          <div {...api().getControlProps()}>
            <input {...api().getInputProps()} />
            <button {...api().getVisibilityTriggerProps()}>
              <span {...api().getIndicatorProps()}>{api().visible ? <EyeIcon /> : <EyeOffIcon />}</span>
            </button>
          </div>
        </div>
      </main>

      <Toolbar controls={controls}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
