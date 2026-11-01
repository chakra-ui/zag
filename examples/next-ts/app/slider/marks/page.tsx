"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import { useId } from "react"
import "@styles/slider.css"

const marks = [
  { value: 0, label: "Low" },
  { value: 50, label: "Medium" },
  { value: 100, label: "High" },
]

export default function Page() {
  const service = useMachine(slider.machine, {
    id: useId(),
    name: "quality",
    defaultValue: [50],
    step: 50,
    thumbSize: 20,
    getAriaValueText: ({ value }) => marks.find((mark) => mark.value === value)?.label ?? String(value),
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <main>
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Quality</label>
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
        <div {...api.getMarkerGroupProps()}>
          {marks.map((mark) => (
            <span key={mark.value} {...api.getMarkerProps({ value: mark.value })}>
              {mark.label}
            </span>
          ))}
        </div>
      </div>
    </main>
  )
}
