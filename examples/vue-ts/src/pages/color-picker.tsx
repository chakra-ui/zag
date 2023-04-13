import * as colorPicker from "@zag-js/color-picker"
import { colorPickerControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, defineComponent } from "vue"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"
import { useControls } from "../hooks/use-controls"

export default defineComponent({
  name: "ColorPicker",
  setup() {
    const controls = useControls(colorPickerControls)

    const [state, send] = useMachine(colorPicker.machine({ id: "1", value: "hsl(0, 100%, 50%)" }), {
      context: controls.context,
    })

    const apiRef = computed(() => colorPicker.connect(state.value, send, normalizeProps))

    return () => {
      const api = apiRef.value
      const [hue, saturation, lightness] = api.channels

      return (
        <>
          <main class="color-picker">
            <div {...api.contentProps}>
              <div {...api.getAreaProps({ xChannel: saturation, yChannel: lightness })}>
                <div {...api.getAreaGradientProps({ xChannel: saturation, yChannel: lightness })} />
                <div {...api.getAreaThumbProps({ xChannel: saturation, yChannel: lightness })} />
              </div>

              <div {...api.getChannelSliderTrackProps({ channel: hue })}>
                <div {...api.getChannelSliderThumbProps({ channel: hue })} />
              </div>

              <div {...api.getChannelSliderTrackProps({ channel: "alpha" })}>
                <div {...api.getChannelSliderBackgroundProps({ channel: "alpha" })} />
                <div {...api.getChannelSliderThumbProps({ channel: "alpha" })} />
              </div>

              <div style={{ display: "flex", width: "100%" }}>
                <input {...api.getChannelInputProps({ channel: hue })} />
                <input {...api.getChannelInputProps({ channel: saturation })} />
                <input {...api.getChannelInputProps({ channel: lightness })} />
                <input {...api.getChannelInputProps({ channel: "alpha" })} />
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <div {...api.getSwatchProps({ value: api.valueAsColor, readOnly: true })}>
                  <div {...api.getSwatchBackgroundProps({ value: api.valueAsColor })} />
                </div>
                <p>{api.value}</p>
              </div>

              <button {...api.eyeDropperTriggerProps}>Eye Dropper</button>
            </div>
          </main>

          <Toolbar viz controls={controls.ui}>
            <StateVisualizer state={state} />
          </Toolbar>
        </>
      )
    }
  },
})
