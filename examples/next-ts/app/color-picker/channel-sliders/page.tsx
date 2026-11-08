"use client"

import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { colorPickerControls } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useControls } from "@/hooks/use-controls"
import "@styles/color-picker.css"

const sliders = [
  { channel: "hue", label: "Hue" },
  { channel: "alpha", label: "Alpha" },
] as const

export default function Page() {
  const controls = useControls(colorPickerControls)

  const service = useMachine(colorPicker.machine, {
    id: useId(),
    name: "color",
    defaultValue: colorPicker.parse("hsla(210, 90%, 55%, 0.8)"),
    ...controls.context,
    inline: true,
  })

  const api = colorPicker.connect(service, normalizeProps)

  return (
    <>
      <main className="color-picker">
        <div {...api.getRootProps()}>
          <div {...api.getContentProps()} className="channel-sliders">
            <div className="channel-sliders__preview">
              <div className="channel-sliders__swatch">
                <div {...api.getTransparencyGridProps({ size: "8px" })} />
                <div {...api.getSwatchProps({ value: api.value })} />
              </div>
              <div className="channel-sliders__value">
                <span {...api.getValueTextProps()}>{api.valueAsString}</span>
                <input {...api.getChannelInputProps({ channel: "hex" })} />
              </div>
            </div>

            {sliders.map(({ channel, label }) => (
              <div key={channel} className="channel-sliders__field">
                <div className="channel-sliders__header">
                  <label {...api.getChannelSliderLabelProps({ channel })}>{label}</label>
                  <span {...api.getChannelSliderValueTextProps({ channel })}>
                    {api.value.toFormat("hsla").formatChannelValue(channel, "en-US")}
                  </span>
                </div>
                <div {...api.getChannelSliderProps({ channel })}>
                  {channel === "alpha" && <div {...api.getTransparencyGridProps({ size: "10px" })} />}
                  <div {...api.getChannelSliderTrackProps({ channel })} />
                  <div {...api.getChannelSliderThumbProps({ channel })} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Toolbar controls={controls.ui}>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
