import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/angle-slider.css"

export default function Page() {
  const service = useMachine(angleSlider.machine, { id: createUniqueId(), defaultValue: 210 })
  const api = createMemo(() => angleSlider.connect(service, normalizeProps))

  return (
    <main class="angle-slider angle-slider-hue">
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>
          Hue
          <span {...api().getValueTextProps()}>{api().value}°</span>
        </label>
        <div {...api().getControlProps()}>
          <div class="angle-slider-hue-preview" style={{ background: `hsl(${api().value} 90% 55%)` }} />
          <div {...api().getThumbProps()} />
        </div>
        <input {...api().getHiddenInputProps()} />
      </div>
    </main>
  )
}
