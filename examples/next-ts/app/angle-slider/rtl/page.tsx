"use client"

import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import "@styles/angle-slider.css"

export default function Page() {
  const service = useMachine(angleSlider.machine, {
    id: useId(),
    dir: "rtl",
  })

  const api = angleSlider.connect(service, normalizeProps)

  return (
    <main className="angle-slider" dir="rtl">
      <h1>Angle Slider — RTL</h1>

      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>
          Angle Slider: <div {...api.getValueTextProps()}>{api.valueAsDegree}</div>
        </label>
        <div {...api.getControlProps()}>
          <div {...api.getThumbProps()}></div>
          <div {...api.getMarkerGroupProps()}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((value) => (
              <div key={value} {...api.getMarkerProps({ value })}></div>
            ))}
          </div>
        </div>
        <input {...api.getHiddenInputProps()} />
      </div>
    </main>
  )
}
