import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { Show } from "../components/show"

export default function Page() {
  const service = useMachine(colorPicker.machine, {
    id: useId(),
    defaultValue: colorPicker.parse("#3b82f6"),
    name: "color",
    format: "rgba",
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
                <div style={{ display: "flex", width: "100%" }}>
                  <span>H</span> <input {...api.getChannelInputProps({ channel: "hue" })} />
                  <span>S</span> <input {...api.getChannelInputProps({ channel: "saturation" })} />
                  <span>L</span> <input {...api.getChannelInputProps({ channel: "lightness" })} />
                  <span>A</span> <input {...api.getChannelInputProps({ channel: "alpha" })} />
                </div>
              </Show>

              <Show when={api.format.startsWith("rgb")}>
                <div style={{ display: "flex", width: "100%" }}>
                  <span>R</span> <input {...api.getChannelInputProps({ channel: "red" })} />
                  <span>G</span> <input {...api.getChannelInputProps({ channel: "green" })} />
                  <span>B</span> <input {...api.getChannelInputProps({ channel: "blue" })} />
                  <span>A</span> <input {...api.getChannelInputProps({ channel: "alpha" })} />
                </div>
              </Show>

              <Show when={api.format.startsWith("hsb")}>
                <div style={{ display: "flex", width: "100%" }}>
                  <span>H</span> <input {...api.getChannelInputProps({ channel: "hue" })} />
                  <span>S</span> <input {...api.getChannelInputProps({ channel: "saturation" })} />
                  <span>B</span> <input {...api.getChannelInputProps({ channel: "brightness" })} />
                  <span>A</span> <input {...api.getChannelInputProps({ channel: "alpha" })} />
                </div>
              </Show>
            </div>
          </div>
        </div>
      </form>
    </main>
  )
}
