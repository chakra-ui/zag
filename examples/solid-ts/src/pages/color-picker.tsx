import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { colorPickerControls } from "@zag-js/shared"
import { createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default function Page() {
  const controls = useControls(colorPickerControls)

  const [state, send] = useMachine(
    colorPicker.machine({
      id: createUniqueId(),
      value: "hsl(0, 100%, 50%)",
    }),
    {
      context: controls.context,
    },
  )

  const api = createMemo(() => colorPicker.connect(state, send, normalizeProps))
  const [hue, saturation, lightness] = api().channels

  return (
    <>
      <main class="color-picker">
        <div {...api().contentProps}>
          <div {...api().getAreaProps({ xChannel: saturation, yChannel: lightness })}>
            <div {...api().getAreaGradientProps({ xChannel: saturation, yChannel: lightness })} />
            <div {...api().getAreaThumbProps({ xChannel: saturation, yChannel: lightness })} />
          </div>

          <div {...api().getChannelSliderTrackProps({ channel: hue })}>
            <div {...api().getChannelSliderThumbProps({ channel: hue })} />
          </div>

          <div {...api().getChannelSliderTrackProps({ channel: "alpha" })}>
            <div {...api().getChannelSliderBackgroundProps({ channel: "alpha" })} />
            <div {...api().getChannelSliderThumbProps({ channel: "alpha" })} />
          </div>

          <div style={{ display: "flex", width: "100%" }}>
            <input {...api().getChannelInputProps({ channel: hue })} />
            <input {...api().getChannelInputProps({ channel: saturation })} />
            <input {...api().getChannelInputProps({ channel: lightness })} />
            <input {...api().getChannelInputProps({ channel: "alpha" })} />
          </div>

          <div style={{ display: "flex", gap: "10px", "align-items": "center" }}>
            <div {...api().getSwatchProps({ value: api().valueAsColor, readOnly: true })} data-testid="readonly-swatch">
              <div {...api().getSwatchBackgroundProps({ value: api().valueAsColor })} />
            </div>
            <p data-testid="value">{api().value}</p>
          </div>

          <input {...api().getChannelInputProps({ channel: "hex" })} />

          <div style={{ display: "flex", gap: "10px" }}>
            <div {...api().getSwatchProps({ value: "#f47373" })} data-testid="clickable-swatch-1">
              <div {...api().getSwatchBackgroundProps({ value: "#f47373" })} />
            </div>

            <div {...api().getSwatchProps({ value: "#697689" })} data-testid="clickable-swatch-2">
              <div {...api().getSwatchBackgroundProps({ value: "#697689" })} />
            </div>
          </div>

          <button {...api().eyeDropperTriggerProps}>Eye Dropper</button>
        </div>
      </main>

      <Toolbar viz controls={controls.ui}>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
