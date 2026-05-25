import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, Index } from "solid-js"
import "@styles/angle-slider.css"

export default function Page() {
  const id = createUniqueId()
  const service = useMachine(angleSlider.machine, () => ({ id, dir: "rtl" as const }))
  const api = createMemo(() => angleSlider.connect(service, normalizeProps))

  return (
    <main class="angle-slider" dir="rtl">
      <h1>Angle Slider — RTL</h1>
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>
          Angle Slider: <div {...api().getValueTextProps()}>{api().valueAsDegree}</div>
        </label>
        <div {...api().getControlProps()}>
          <div {...api().getThumbProps()}></div>
          <div {...api().getMarkerGroupProps()}>
            <Index each={[0, 45, 90, 135, 180, 225, 270, 315]}>
              {(value) => <div {...api().getMarkerProps({ value: value() })}></div>}
            </Index>
          </div>
        </div>
        <input {...api().getHiddenInputProps()} />
      </div>
    </main>
  )
}
