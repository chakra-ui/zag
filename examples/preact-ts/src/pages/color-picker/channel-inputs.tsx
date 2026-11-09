import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { useId } from "preact/hooks"
import "@styles/color-picker.css"

const formats = [
  { value: "rgba", label: "RGBA", channels: ["red", "green", "blue", "alpha"] },
  { value: "hsla", label: "HSLA", channels: ["hue", "saturation", "lightness", "alpha"] },
  { value: "hsba", label: "HSBA", channels: ["hue", "saturation", "brightness", "alpha"] },
] as const

export default function Page() {
  const service = useMachine(colorPicker.machine, {
    id: useId(),
    inline: true,
    defaultFormat: "hsla",
    defaultValue: colorPicker.parse("#3b82f6"),
  })

  const api = colorPicker.connect(service, normalizeProps)
  const channels = formats.find((format) => format.value === api.format)?.channels ?? []

  return (
    <main className="color-picker">
      <div {...api.getRootProps()}>
        <div {...api.getContentProps()}>
          <div className="content__inner">
            <div {...api.getAreaProps()}>
              <div {...api.getAreaBackgroundProps()} />
              <div {...api.getAreaThumbProps()} />
            </div>

            <select {...api.getFormatSelectProps()}>
              {formats.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>

            <div className="color-picker-channel-inputs">
              {channels.map((channel) => (
                <label key={channel}>
                  {channel}
                  <input {...api.getChannelInputProps({ channel })} />
                </label>
              ))}
            </div>

            <input {...api.getChannelInputProps({ channel: "hex" })} />
            <output aria-label="Color value">{api.valueAsString}</output>
          </div>
        </div>
      </div>
    </main>
  )
}
