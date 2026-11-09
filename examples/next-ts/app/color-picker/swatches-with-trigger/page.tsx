"use client"

import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CheckIcon, PlusIcon } from "lucide-react"
import { useId, useState } from "react"
import "@styles/color-picker.css"

export default function Page() {
  const [swatches, setSwatches] = useState(["#EF4444", "#22C55E", "#3B82F6"])

  const service = useMachine(colorPicker.machine, {
    id: useId(),
    defaultValue: colorPicker.parse("#3b82f6"),
  })

  const api = colorPicker.connect(service, normalizeProps)

  const saveSwatch = () => {
    const color = api.value.toString("hex")
    if (!swatches.includes(color)) setSwatches([...swatches, color])
  }

  return (
    <main className="color-picker">
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>
          Highlight: <span {...api.getValueTextProps()}>{api.valueAsString}</span>
        </label>

        <div {...api.getSwatchGroupProps()} className="color-picker-swatches">
          {swatches.map((swatch) => (
            <button
              key={swatch}
              {...api.getSwatchTriggerProps({ value: swatch })}
              className="color-picker-swatch-button"
            >
              <div {...api.getSwatchProps({ value: swatch })} />
              <span {...api.getSwatchIndicatorProps({ value: swatch })}>
                <CheckIcon size={16} />
              </span>
            </button>
          ))}
          <button {...api.getTriggerProps()} className="color-picker-add-button">
            <PlusIcon size={16} />
          </button>
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

              <input {...api.getChannelInputProps({ channel: "hex" })} />

              <button type="button" onClick={saveSwatch}>
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
