"use client"

import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import "@styles/angle-slider.css"

export default function Page() {
  const service = useMachine(angleSlider.machine, {
    id: useId(),
    defaultValue: 120,
  })

  const api = angleSlider.connect(service, normalizeProps)

  return (
    <main className="angle-slider angle-slider-knob">
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>
          Shadow angle
          <span {...api.getValueTextProps()}>{api.value}°</span>
        </label>
        <div {...api.getControlProps()}>
          <div {...api.getThumbProps()} />
        </div>
        <input {...api.getHiddenInputProps()} />
      </div>
    </main>
  )
}
