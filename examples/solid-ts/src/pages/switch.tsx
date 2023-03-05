import * as zagSwitch from "@zag-js/switch"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { switchControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(switchControls)

  const [state, send] = useMachine(zagSwitch.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => zagSwitch.connect(state, send, normalizeProps))

  return (
    <>
      <main class="switch">
        <label {...api().rootProps}>
          <input type="checkbox" {...api().inputProps} />
          <span {...api().controlProps}>
            <span {...api().thumbProps} />
          </span>
          <span {...api().labelProps}>Feature is {api().isChecked ? "enabled" : "disabled"}</span>
        </label>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
