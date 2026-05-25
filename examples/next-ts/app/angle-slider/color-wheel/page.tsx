"use client"

import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import "@styles/angle-slider-custom.css"

export default function Page() {
  const service = useMachine(angleSlider.machine, {
    id: useId(),
    defaultValue: 0,
  })

  const api = angleSlider.connect(service, normalizeProps)

  const color = `hsl(${api.value} 100% 50%)`

  return (
    <main className="angle-slider angle-slider-color-wheel">
      <h1>Angle Slider — Color Wheel (Hue)</h1>

      <div className="swatch" style={{ background: color }} />

      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>
          Hue: <div {...api.getValueTextProps()}>{api.value}°</div>
        </label>
        <div {...api.getControlProps()}>
          <div {...api.getThumbProps()}></div>
        </div>
        <input {...api.getHiddenInputProps()} />
      </div>
    </main>
  )
}
