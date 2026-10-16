import { normalizeProps, useMachine } from "@zag-js/preact"
import * as slider from "@zag-js/slider"
import { useId } from "react"
import "@styles/slider.css"

const marks = [0, 25, 50, 75, 100]

export default function Page() {
  const service = useMachine(slider.machine, {
    id: useId(),
    name: "quantity",
    defaultValue: [20, 60],
    thumbSize: 20,
    getAriaLabel: ({ index }) => (index === 0 ? "Minimum quantity" : "Maximum quantity"),
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <main>
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Quantity</label>
        <output {...api.getValueTextProps()}>{api.value.join(" – ")}</output>
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
          {marks.map((value) => (
            <span key={value} {...api.getMarkerProps({ value })}>
              {value}
            </span>
          ))}
        </div>
      </div>
    </main>
  )
}
