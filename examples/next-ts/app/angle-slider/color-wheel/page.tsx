"use client"

import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import "@styles/angle-slider.css"

export default function Page() {
  const service = useMachine(angleSlider.machine, {
    id: useId(),
    defaultValue: 210,
  })

  const api = angleSlider.connect(service, normalizeProps)

  return (
    <main className="angle-slider angle-slider-hue">
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>
          Hue
          <span {...api.getValueTextProps()}>{api.value}°</span>
        </label>
        <div {...api.getControlProps()}>
          <div className="angle-slider-hue-preview" style={{ background: `hsl(${api.value} 90% 55%)` }} />
          <div {...api.getThumbProps()} />
        </div>
        <input {...api.getHiddenInputProps()} />
      </div>
    </main>
  )
}
