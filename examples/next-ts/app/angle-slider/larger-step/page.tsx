"use client"

import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import "@styles/angle-slider.css"

const STEP = 45
const MARKERS = [0, 45, 90, 135, 180, 225, 270, 315]
const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]

export default function Page() {
  const service = useMachine(angleSlider.machine, {
    id: useId(),
    step: STEP,
  })

  const api = angleSlider.connect(service, normalizeProps)

  return (
    <main className="angle-slider">
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>
          Wind direction
          <span {...api.getValueTextProps()}>
            {api.value}° {DIRECTIONS[Math.round(api.value / STEP) % DIRECTIONS.length]}
          </span>
        </label>
        <div {...api.getControlProps()}>
          <div className="angle-slider-compass" aria-hidden>
            <span>N</span>
            <span>E</span>
            <span>S</span>
            <span>W</span>
          </div>
          <div {...api.getThumbProps()} />
          <div {...api.getMarkerGroupProps()}>
            {MARKERS.map((value) => (
              <div key={value} {...api.getMarkerProps({ value })} />
            ))}
          </div>
        </div>
        <input {...api.getHiddenInputProps()} />
      </div>
    </main>
  )
}
