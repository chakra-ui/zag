import { normalizeProps, useMachine } from "@zag-js/preact"
import * as slider from "@zag-js/slider"
import { useId } from "preact/hooks"
import "@styles/slider.css"

export default function Page() {
  const service = useMachine(slider.machine, {
    id: useId(),
    name: "frequency",
    defaultValue: [440],
    min: 20,
    max: 20000,
    thumbSize: 20,
    scale: "log",
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <main>
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Frequency</label>
        <output {...api.getValueTextProps()}>{api.getThumbValue(0)} Hz</output>
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
    </main>
  )
}
