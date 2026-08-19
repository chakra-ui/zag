import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/angle-slider-custom.css"

export default function Page() {
  const id = createUniqueId()
  const service = useMachine(angleSlider.machine, () => ({ id, defaultValue: 0 }))
  const api = createMemo(() => angleSlider.connect(service, normalizeProps))
  const color = createMemo(() => `hsl(${api().value} 100% 50%)`)

  return (
    <main class="angle-slider angle-slider-color-wheel">
      <h1>Angle Slider — Color Wheel (Hue)</h1>
      <div class="swatch" style={{ background: color() }} />
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>
          Hue: <div {...api().getValueTextProps()}>{api().value}°</div>
        </label>
        <div {...api().getControlProps()}>
          <div {...api().getThumbProps()}></div>
        </div>
        <input {...api().getHiddenInputProps()} />
      </div>
    </main>
  )
}
