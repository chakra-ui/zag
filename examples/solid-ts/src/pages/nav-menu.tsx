import * as nav-menu from "@zag-js/nav-menu"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { nav-menuControls, nav-menuData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(nav-menuControls)

  const [state, send] = useMachine(nav-menu.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => nav-menu.connect(state, send, normalizeProps))

  return (
    <>
      <main class="nav-menu"> 
        <div {...api().rootProps}> 
            
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
