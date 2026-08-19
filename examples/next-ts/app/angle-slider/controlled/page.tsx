"use client"

import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import "@styles/angle-slider.css"

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
      <h1>Angle Slider — Controlled</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <input
          type="number"
          min={0}
          max={359}
          value={value}
          onChange={(event) => {
            const next = event.currentTarget.valueAsNumber
            setValue(Number.isNaN(next) ? 0 : Math.min(359, Math.max(0, next)))
          }}
        />
        <button type="button" onClick={() => setValue(0)}>
          Reset
        </button>
      </div>

      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>
          Angle Slider: <div {...api.getValueTextProps()}>{api.valueAsDegree}</div>
        </label>
        <div {...api.getControlProps()}>
          <div {...api.getThumbProps()}></div>
        </div>
        <input {...api.getHiddenInputProps()} />
      </div>
    </main>
  )
}
