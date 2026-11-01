"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import { useId, useState } from "react"
import "@styles/slider.css"

const presets = [
  { label: "Any", value: [0, 1000] },
  { label: "Under $250", value: [0, 250] },
  { label: "$250 – $500", value: [250, 500] },
  { label: "$500+", value: [500, 1000] },
]

export default function Page() {
  const [value, setValue] = useState([200, 600])

  const service = useMachine(slider.machine, {
    id: useId(),
    name: "price",
    value,
    min: 0,
    max: 1000,
    step: 10,
    thumbSize: 20,
    getAriaLabel: ({ index }) => (index === 0 ? "Minimum price" : "Maximum price"),
    onValueChange(details) {
      setValue(details.value)
    },
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <main>
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Price</label>
        <output {...api.getValueTextProps()}>
          ${value[0]} – ${value[1]}
        </output>
        <div {...api.getControlProps()}>
          <div {...api.getTrackProps()}>
            <div {...api.getRangeProps()} />
          </div>
          {api.value.map((_, index) => (
            <div key={index} {...api.getThumbProps({ index })}>
              <input {...api.getHiddenInputProps({ index })} />
            </div>
          ))}
        </div>
      </div>
      <div className="hstack">
        {presets.map((preset) => (
          <button key={preset.label} type="button" onClick={() => setValue(preset.value)}>
            {preset.label}
          </button>
        ))}
      </div>
    </main>
  )
}
