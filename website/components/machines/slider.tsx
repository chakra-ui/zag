import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export function Slider(props: any) {
  const [state, send] = useMachine(
    slider.machine({ id: useId(), min: -50, max: 50, value: [20] }),
    { context: props.controls },
  )

  const api = slider.connect(state, send, normalizeProps)

  return (
    <div {...api.rootProps}>
      <div>
        <label {...api.labelProps}>Quantity</label>
        <output {...api.valueTextProps}>
          <b>{api.value.at(0)}</b>
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
