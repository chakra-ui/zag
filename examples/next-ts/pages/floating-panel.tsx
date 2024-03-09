import * as floating-panel from "@zag-js/floating-panel"
import { useMachine, normalizeProps } from "@zag-js/react"
import { floating-panelControls, floating-panelData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(floating-panelControls)

  const [state, send] = useMachine(floating-panel.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = floating-panel.connect(state, send, normalizeProps)

  return (
    <>
      <main className="floating-panel">
        <div {...api.rootProps}>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
