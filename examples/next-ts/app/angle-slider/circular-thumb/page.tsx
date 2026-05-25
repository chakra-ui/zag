"use client"

import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import "@styles/angle-slider-custom.css"

export default function Page() {
  const service = useMachine(angleSlider.machine, {
    id: useId(),
  })

  const api = angleSlider.connect(service, normalizeProps)

  return (
    <main className="angle-slider angle-slider-circular">
      <h1>Angle Slider — Circular Thumb</h1>

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
