import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { colorPickerControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(colorPickerControls)

  const [state, send] = useMachine(
    colorPicker.machine({
      id: useId(),
      format: "hsla",
      value: "hsl(0, 100%, 50%)",
    }),
    {
      context: controls.context,
    },
  )

  const api = colorPicker.connect(state, send, normalizeProps)
  const [hue, saturation, lightness] = api.channels

  return (
    <>
      <main className="color-picker">
        <div data-scope="color-picker" data-part="content">
          <div {...api.getAreaProps({ xChannel: saturation, yChannel: lightness })}>
            <div {...api.getAreaGradientProps({ xChannel: saturation, yChannel: lightness })} />
            <div {...api.getAreaThumbProps({ xChannel: saturation, yChannel: lightness })} />
          </div>

          <div {...api.getSliderTrackProps({ channel: hue })}>
            <div {...api.getSliderThumbProps({ channel: hue })} />
          </div>

          <div {...api.getSliderTrackProps({ channel: "alpha" })}>
            <div {...api.getSliderBackgroundProps({ channel: "alpha" })} />
            <div {...api.getSliderThumbProps({ channel: "alpha" })} />
          </div>
        </div>
      </main>

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
