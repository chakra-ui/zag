import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

interface SliderProps extends Omit<slider.Props, "id"> {}

export function Slider(props: SliderProps) {
  const service = useMachine(slider.machine, {
    id: useId(),
    min: -50,
    max: 50,
    defaultValue: [20],
    ...props,
    thumbAlignment: "center",
    thumbSize: { width: 20, height: 20 },
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div>
        <label {...api.getLabelProps()}>Quantity</label>
        <output {...api.getValueTextProps()}>
          <b>{api.value.at(0)}</b>
        </output>
      </div>

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
  )
}
