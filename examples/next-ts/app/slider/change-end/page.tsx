"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import { useId, useState } from "react"
import { Output } from "@/components/output"
import "@styles/slider.css"

export default function Page() {
  const [value, setValue] = useState([50])
  const [endValue, setEndValue] = useState([50])

  const service = useMachine(slider.machine, {
    id: useId(),
    name: "brightness",
    defaultValue: [50],
    thumbSize: 20,
    onValueChange(details) {
      setValue(details.value)
    },
    onValueChangeEnd(details) {
      setEndValue(details.value)
    },
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <main>
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Brightness</label>
        <output {...api.getValueTextProps()}>{api.value}</output>
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
      <div className="hstack gap-4">
        <Output label="onValueChange" value={value[0]} />
        <Output label="onValueChangeEnd" value={endValue[0]} />
      </div>
    </main>
  )
}
