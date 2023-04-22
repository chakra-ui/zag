import * as zagSwitch from "@zag-js/switch"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { switchControls } from "@zag-js/shared"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(switchControls)

  const [state, send] = useMachine(zagSwitch.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = zagSwitch.connect(state, send, normalizeProps)

  return (
    <>
      <main className="switch">
        <label {...api.rootProps}>
          <input {...api.inputProps} />
          <span {...api.controlProps}>
            <span {...api.thumbProps} />
          </span>
          <span {...api.labelProps}>Feature is {api.isChecked ? "enabled" : "disabled"}</span>
        </label>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
