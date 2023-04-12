import * as colorPicker from "@zag-js/color-picker"
import { useMachine, normalizeProps } from "@zag-js/react"
import { colorPickerControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(colorPickerControls)

  const [state, send] = useMachine(colorPicker.machine({ id: useId() }), {
    context: controls.context,
  })

  const api = colorPicker.connect(state, send, normalizeProps)

  return (
    <>
      <main className="color-picker">
        <div {...api.rootProps}></div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
