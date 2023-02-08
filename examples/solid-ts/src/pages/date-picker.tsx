import * as datePicker from "@zag-js/date-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import { datePickerControls } from "@zag-js/shared"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(datePickerControls)

  const [state, send] = useMachine(datePicker.machine({ id: createUniqueId() }), {
    context: controls.context,
  })

  const api = createMemo(() => datePicker.connect(state, send, normalizeProps))

  return (
    <>
      <main class="date-picker">
        <div {...api().rootProps}></div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
