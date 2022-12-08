import * as datePicker from "@zag-js/date-picker"
import { useMachine, normalizeProps } from "@zag-js/react"
import { datePickerControls, datePickerData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(datePickerControls)

  const [state, send] = useMachine(datePicker.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = datePicker.connect(state, send, normalizeProps)

  return (
    <>
      <main className="date-picker">
        <div {...api.rootProps}></div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
