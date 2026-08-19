import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/angle-slider-custom.css"

export default function Page() {
  const id = createUniqueId()
  const service = useMachine(angleSlider.machine, () => ({ id }))
  const api = createMemo(() => angleSlider.connect(service, normalizeProps))

  return (
    <main class="angle-slider angle-slider-circular">
      <h1>Angle Slider — Circular Thumb</h1>
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>
          Angle Slider: <div {...api().getValueTextProps()}>{api().valueAsDegree}</div>
        </label>
        <div {...api().getControlProps()}>
          <div {...api().getThumbProps()}></div>
        </div>
        <input {...api().getHiddenInputProps()} />
      </div>
    </main>
  )
}
