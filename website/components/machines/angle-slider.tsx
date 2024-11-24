import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"

export function AngleSlider(props: any) {
  const [state, send] = useMachine(angleSlider.machine({ id: useId() }), {
    context: props.controls,
  })

  const api = angleSlider.connect(state, send, normalizeProps)

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Wind direction</label>
      <div {...api.getControlProps()}>
        <div {...api.getThumbProps()}></div>
        <div {...api.getMarkerGroupProps()}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((value) => (
            <div key={value} {...api.getMarkerProps({ value })}></div>
          ))}
        </div>
      </div>
      <div {...api.getValueTextProps()}>{api.value} degrees</div>
      <input {...api.getHiddenInputProps()} />
    </div>
  )
}
