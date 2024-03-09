import * as floating-panel from "@zag-js/floating-panel"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { floating-panelControls, floating-panelData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(floating-panelControls)

  const [state, send] = useMachine(floating-panel.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => floating-panel.connect(state, send, normalizeProps))

  return (
    <>
      <main class="floating-panel"> 
        <div {...api().rootProps}> 
            
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
