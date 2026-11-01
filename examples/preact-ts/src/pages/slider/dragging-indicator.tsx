import { normalizeProps, useMachine } from "@zag-js/preact"
import * as slider from "@zag-js/slider"
import { useId } from "react"
import "@styles/slider.css"

export default function Page() {
  const service = useMachine(slider.machine, {
    id: useId(),
    name: "temperature",
    defaultValue: [21],
    min: 10,
    max: 30,
    thumbSize: 20,
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <main>
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Temperature</label>
        <div {...api.getControlProps()}>
          <div {...api.getTrackProps()}>
            <div {...api.getRangeProps()} />
          </div>
          {api.value.map((_, index) => (
            <div key={index} {...api.getThumbProps({ index })}>
              <input {...api.getHiddenInputProps({ index })} />
            </div>
          ))}
          <span {...api.getDraggingIndicatorProps({ index: 0 })}>{api.getThumbValue(0)}°C</span>
        </div>
      </div>
    </main>
  )
}
