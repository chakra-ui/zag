"use client"

import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import "@styles/angle-slider.css"

const PRESETS = [0, 90, 180, 270]

export default function Page() {
  const [value, setValue] = useState(45)

  const service = useMachine(angleSlider.machine, {
    id: useId(),
    value,
    onValueChange: (details) => setValue(details.value),
  })

  const api = angleSlider.connect(service, normalizeProps)

  return (
    <main className="angle-slider">
      <div className="angle-slider-layout">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>
            Rotation
            <span {...api.getValueTextProps()}>{api.value}°</span>
          </label>
          <div {...api.getControlProps()}>
            <div {...api.getThumbProps()} />
          </div>
          <input {...api.getHiddenInputProps()} />
        </div>

        <div className="angle-slider-presets">
          {PRESETS.map((preset) => (
            <button key={preset} aria-pressed={value === preset} onClick={() => setValue(preset)}>
              {preset}°
            </button>
          ))}
          <input
            type="number"
            aria-label="Rotation in degrees"
            min={0}
            max={359}
            value={value}
            onChange={(event) => {
              const next = event.currentTarget.valueAsNumber
              setValue(Number.isNaN(next) ? 0 : Math.min(359, Math.max(0, next)))
            }}
          />
        </div>
      </div>
    </main>
  )
}
