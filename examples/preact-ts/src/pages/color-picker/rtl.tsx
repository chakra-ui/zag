import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId } from "preact/hooks"
import { Show } from "../../components/show"
import "@styles/color-picker.css"

export default function Page() {
  const service = useMachine(colorPicker.machine, {
    id: useId(),
    defaultValue: colorPicker.parse("#3b82f6"),
    name: "color",
    format: "hsla",
    dir: "rtl",
  })

  const api = colorPicker.connect(service, normalizeProps)

  return (
    <main className="color-picker">
      <form {...api.getRootProps()}>
        <label {...api.getLabelProps()}>
          {"اختر اللون"} ({api.valueAsString})
        </label>
        <input {...api.getHiddenInputProps()} />

        <div {...api.getControlProps()}>
          <button {...api.getTriggerProps()}>
            <div {...api.getTransparencyGridProps({ size: "4px" })} />
            <div {...api.getSwatchProps({ value: api.value })} />
          </button>

          <input {...api.getChannelInputProps({ channel: "hex" })} />
          <input {...api.getChannelInputProps({ channel: "alpha" })} />
        </div>

        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>
            <div className="content__inner">
              <div {...api.getAreaProps()}>
                <div {...api.getAreaBackgroundProps()} />
                <div {...api.getAreaThumbProps()} />
              </div>

              <div {...api.getChannelSliderProps({ channel: "hue" })}>
                <div {...api.getChannelSliderTrackProps({ channel: "hue" })} />
                <div {...api.getChannelSliderThumbProps({ channel: "hue" })} />
              </div>

              <div {...api.getChannelSliderProps({ channel: "alpha" })}>
                <div {...api.getTransparencyGridProps({ size: "8px" })} />
                <div {...api.getChannelSliderTrackProps({ channel: "alpha" })} />
                <div {...api.getChannelSliderThumbProps({ channel: "alpha" })} />
              </div>

              <Show when={api.format.startsWith("hsl")}>
                <div className="color-picker-channel-inputs">
                  <label>
                    H <input {...api.getChannelInputProps({ channel: "hue" })} />
                  </label>
                  <label>
                    S <input {...api.getChannelInputProps({ channel: "saturation" })} />
                  </label>
                  <label>
                    L <input {...api.getChannelInputProps({ channel: "lightness" })} />
                  </label>
                  <label>
                    A <input {...api.getChannelInputProps({ channel: "alpha" })} />
                  </label>
                </div>
              </Show>

              <Show when={api.format.startsWith("rgb")}>
                <div className="color-picker-channel-inputs">
                  <label>
                    R <input {...api.getChannelInputProps({ channel: "red" })} />
                  </label>
                  <label>
                    G <input {...api.getChannelInputProps({ channel: "green" })} />
                  </label>
                  <label>
                    B <input {...api.getChannelInputProps({ channel: "blue" })} />
                  </label>
                  <label>
                    A <input {...api.getChannelInputProps({ channel: "alpha" })} />
                  </label>
                </div>
              </Show>

              <Show when={api.format.startsWith("hsb")}>
                <div className="color-picker-channel-inputs">
                  <label>
                    H <input {...api.getChannelInputProps({ channel: "hue" })} />
                  </label>
                  <label>
                    S <input {...api.getChannelInputProps({ channel: "saturation" })} />
                  </label>
                  <label>
                    B <input {...api.getChannelInputProps({ channel: "brightness" })} />
                  </label>
                  <label>
                    A <input {...api.getChannelInputProps({ channel: "alpha" })} />
                  </label>
                </div>
              </Show>
            </div>
          </div>
        </div>
      </form>
    </main>
  )
}
