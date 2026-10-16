"use client"

import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import { useId } from "react"
import "@styles/slider.css"

interface OriginSliderProps {
  label: string
  props: Partial<slider.Props>
  format: (value: number) => string
  marks?: number[]
}

function OriginSlider({ label, props, format, marks }: OriginSliderProps) {
  const service = useMachine(slider.machine, { id: useId(), thumbSize: 20, ...props })
  const api = slider.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>{label}</label>
      <output {...api.getValueTextProps()}>{format(api.value[0])}</output>
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
      {marks && (
        <div {...api.getMarkerGroupProps()}>
          {marks.map((value) => (
            <span key={value} {...api.getMarkerProps({ value })}>
              {value > 0 ? `+${value}` : value}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <main>
      <div className="vstack gap-8">
        <OriginSlider
          label="Balance"
          props={{ name: "balance", origin: "center", min: -50, max: 50, defaultValue: [20] }}
          format={(value) => (value === 0 ? "Center" : `${value < 0 ? "L" : "R"} ${Math.abs(value)}`)}
        />
        <OriginSlider
          label="Exposure"
          props={{ name: "exposure", origin: 0, min: -3, max: 1, step: 0.1, defaultValue: [-1.5] }}
          format={(value) => `${value > 0 ? "+" : ""}${value.toFixed(1)} EV`}
          marks={[-3, -2, -1, 0, 1]}
        />
        <OriginSlider
          label="Fade out"
          props={{ name: "fade-out", origin: "end", defaultValue: [70] }}
          format={(value) => `${100 - value}%`}
        />
      </div>
    </main>
  )
}
