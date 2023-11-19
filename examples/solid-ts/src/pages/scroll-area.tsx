import * as scroll-area from "@zag-js/scroll-area"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { scroll-areaControls, scroll-areaData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(scroll-areaControls)

  const [state, send] = useMachine(scroll-area.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => scroll-area.connect(state, send, normalizeProps))

  return (
    <>
      <main class="scroll-area"> 
        <div {...api().rootProps}> 
            
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
