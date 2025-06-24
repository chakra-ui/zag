import { normalizeProps, useMachine } from "@zag-js/react"
import { toggleGroupControls, toggleGroupData } from "@zag-js/shared"
import * as toggle from "@zag-js/toggle-group"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(toggleGroupControls)

  const service = useMachine(toggle.machine, {
    id: useId(),
    ...controls.context,
  })
  const api = toggle.connect(service, normalizeProps)

  return (
    <>
      <main className="toggle-group">
        <button>Outside</button>
        <div {...api.getRootProps()}>
          {toggleGroupData.map((item) => (
            <button key={item.value} {...api.getItemProps({ value: item.value })}>
              {item.label}
            </button>
          ))}
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} context={["focusedId"]} />
      </Toolbar>
    </>
  )
}
