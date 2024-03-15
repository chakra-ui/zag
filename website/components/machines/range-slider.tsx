import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export function RangeSlider(props: any) {
  const [state, send] = useMachine(
    slider.machine({
      id: useId(),
      name: "quantity",
      value: [10, 60],
    }),
    { context: props.controls },
  )

  const api = slider.connect(state, send, normalizeProps)

  return (
    <div {...api.rootProps}>
      <div>
        <label {...api.labelProps}>Quantity</label>
        <output {...api.valueTextProps}>
          <b>{api.value.join(" - ")}</b>
        </output>
      </div>

      <div {...api.controlProps}>
        <div {...api.trackProps}>
          <div {...api.rangeProps} />
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
