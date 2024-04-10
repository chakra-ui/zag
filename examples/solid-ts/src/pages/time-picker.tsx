import * as timePicker from "@zag-js/time-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { timePickerControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(timePickerControls)

  const [state, send] = useMachine(timePicker.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => timePicker.connect(state, send, normalizeProps))

  return (
    <>
      <main class="time-picker">
        <div {...api().rootProps}></div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
