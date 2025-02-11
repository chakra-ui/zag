import * as zagSwitch from "@zag-js/switch"
import { useMachine, normalizeProps } from "@zag-js/react"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { switchControls } from "@zag-js/shared"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(switchControls)

  const service = useMachine(zagSwitch.machine, {
    id: useId(),
    name: "switch",
  })

  const api = zagSwitch.connect(service, normalizeProps)

  return (
    <>
      <main className="switch">
        <label {...api.getRootProps()}>
          <input {...api.getHiddenInputProps()} data-testid="hidden-input" />
          <span {...api.getControlProps()}>
            <span {...api.getThumbProps()} />
          </span>
          <span {...api.getLabelProps()}>Feature is {api.checked ? "enabled" : "disabled"}</span>
        </label>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
