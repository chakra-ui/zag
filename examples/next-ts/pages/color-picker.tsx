import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
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
  const [xChannel, yChannel] = api.channels

  return (
    <>
      <main className="color-picker">
        <div>
          <div {...api.getAreaProps({ xChannel, yChannel })}>
            <div {...api.getAreaGradientProps({ xChannel, yChannel })} />
            <div {...api.getAreaThumbProps({ xChannel, yChannel })} />
          </div>
        </div>
      </main>

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
