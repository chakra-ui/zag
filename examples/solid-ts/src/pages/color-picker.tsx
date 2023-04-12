import * as color-picker from "@zag-js/color-picker"
import { normalizeProps, useMachine, mergeProps } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { color-pickerControls, color-pickerData } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(color-pickerControls)

  const [state, send] = useMachine(color-picker.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => color-picker.connect(state, send, normalizeProps))

  return (
    <>
      <main class="color-picker"> 
        <div {...api().rootProps}> 
            
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
