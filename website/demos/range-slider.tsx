import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

interface RangeSliderProps extends Omit<slider.Props, "id"> {}

export function RangeSlider(props: RangeSliderProps) {
  const service = useMachine(slider.machine, {
    id: useId(),
    name: "quantity",
    defaultValue: [10, 60],
    ...props,
  })

  const api = slider.connect(service, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <div>
        <label {...api.getLabelProps()}>Quantity</label>
        <output {...api.getValueTextProps()}>
          <b>{api.value.join(" - ")}</b>
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
