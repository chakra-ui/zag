import { normalizeProps, useMachine } from "@zag-js/preact"
import * as slider from "@zag-js/slider"
import { useId } from "react"
import "@styles/slider.css"

const weights: Record<number, string> = {
  100: "Thin",
  200: "Extra Light",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semi Bold",
  700: "Bold",
  800: "Extra Bold",
  900: "Black",
}

const stops = Object.keys(weights).map(Number)

export default function Page() {
  const service = useMachine(slider.machine, {
    id: useId(),
    name: "font-weight",
    defaultValue: [400],
    min: 100,
    max: 900,
    step: 100,
    largeStep: 200,
    thumbSize: 20,
    getAriaValueText: ({ value }) => `${value} ${weights[value]}`,
  })

  const api = slider.connect(service, normalizeProps)
  const weight = api.value[0]

  return (
    <main>
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Font weight</label>
        <output {...api.getValueTextProps()}>
          {weight} · {weights[weight]}
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
        <div {...api.getMarkerGroupProps()}>
          {stops.map((value) => (
            <span key={value} {...api.getMarkerProps({ value })} />
          ))}
        </div>
      </div>
      <p style={{ fontWeight: weight }}>The quick brown fox</p>
    </main>
  )
}
