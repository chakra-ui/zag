"use client"

import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import "@styles/color-picker.css"

const presets = ["#f47373", "#697689"]

export default function Page() {
  const [open, setOpen] = useState(false)

  const service = useMachine(colorPicker.machine, {
    id: useId(),
    name: "color",
    defaultFormat: "hsla",
    defaultValue: colorPicker.parse("hsl(0, 100%, 50%)"),
    open,
    onOpenChange: (details) => setOpen(details.open),
  })

  const api = colorPicker.connect(service, normalizeProps)

  return (
    <div style={{ padding: "40px", height: "200vh" }}>
      <h1>Color Picker Controlled</h1>
      <h1>{String(open)}</h1>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button type="button" onClick={() => setOpen(true)}>
          Open
        </button>
        <button type="button" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      <main className="color-picker">
        <input {...api.getHiddenInputProps()} />
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>
            Select Color: <span data-testid="value-text">{api.valueAsString}</span>
          </label>

          <div {...api.getControlProps()}>
            <button {...api.getTriggerProps()}>
              <div {...api.getTransparencyGridProps({ size: "10px" })} />
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
                  <div {...api.getTransparencyGridProps({ size: "12px" })} />
                  <div {...api.getChannelSliderTrackProps({ channel: "alpha" })} />
                  <div {...api.getChannelSliderThumbProps({ channel: "alpha" })} />
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    <div {...api.getTransparencyGridProps({ size: "4px" })} />
                    <div {...api.getSwatchProps({ value: api.value })} />
                  </div>
                  <p data-testid="value-text">{api.valueAsString}</p>
                </div>

                <input {...api.getChannelInputProps({ channel: "hex" })} />

                <div {...api.getSwatchGroupProps()} style={{ display: "flex", gap: "10px" }}>
                  {presets.map((preset) => (
                    <button key={preset} {...api.getSwatchTriggerProps({ value: preset })}>
                      <div style={{ position: "relative" }}>
                        <div {...api.getTransparencyGridProps({ size: "4px" })} />
                        <div {...api.getSwatchProps({ value: preset })} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
