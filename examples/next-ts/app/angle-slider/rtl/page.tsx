"use client"

import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import "@styles/angle-slider.css"

const MARKERS = [0, 45, 90, 135, 180, 225, 270, 315]

export default function Page() {
  const service = useMachine(angleSlider.machine, {
    id: useId(),
    dir: "rtl",
  })

  const api = angleSlider.connect(service, normalizeProps)

  return (
    <main className="angle-slider" dir="rtl">
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>
          الدوران
          <span {...api.getValueTextProps()}>{api.value}°</span>
        </label>
        <div {...api.getControlProps()}>
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
