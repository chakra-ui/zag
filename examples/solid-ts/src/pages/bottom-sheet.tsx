import * as bottomSheet from "@zag-js/bottom-sheet"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { bottomSheetControls, bottomSheetData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(bottomSheetControls)

  const [state, send] = useMachine(bottomSheet.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => bottomSheet.connect(state, send, normalizeProps))

  return (
    <>
      <main class="bottom-sheet"> 
        <div {...api().rootProps}> 
            
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
