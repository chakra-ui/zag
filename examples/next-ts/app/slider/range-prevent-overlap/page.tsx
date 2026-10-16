"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import { useId } from "react"
import "@styles/slider.css"

export default function Page() {
  const service = useMachine(slider.machine, {
    id: useId(),
    name: "hours",
    defaultValue: [9, 17],
    min: 0,
    max: 24,
    minStepsBetweenThumbs: 4,
    thumbSize: 20,
    "aria-label": ["Start hour", "End hour"],
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <main>
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Opening hours</label>
        <output {...api.getValueTextProps()}>
          {api.value[0]}:00 – {api.value[1]}:00
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
      <p className="slider-hint">Open at least 4 hours</p>
    </main>
  )
}
