import { normalizeProps, useMachine } from "@zag-js/preact"
import * as slider from "@zag-js/slider"
import { useId, useState } from "react"
import "@styles/slider.css"

const presets = [0, 25, 50, 100]

export default function Page() {
  const [value, setValue] = useState([25])

  const service = useMachine(slider.machine, {
    id: useId(),
    name: "zoom",
    value,
    thumbSize: 20,
    onValueChange(details) {
      setValue(details.value)
    },
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <main>
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Zoom</label>
        <output {...api.getValueTextProps()}>{value[0]}%</output>
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
      <div className="hstack">
        {presets.map((preset) => (
          <button key={preset} type="button" onClick={() => setValue([preset])}>
            {preset}%
          </button>
        ))}
      </div>
    </main>
  )
}
