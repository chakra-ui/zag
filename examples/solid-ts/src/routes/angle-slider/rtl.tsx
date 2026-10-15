import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, Index } from "solid-js"
import "@styles/angle-slider.css"

const MARKERS = [0, 45, 90, 135, 180, 225, 270, 315]

export default function Page() {
  const service = useMachine(angleSlider.machine, { id: createUniqueId(), dir: "rtl" })
  const api = createMemo(() => angleSlider.connect(service, normalizeProps))

  return (
    <main class="angle-slider" dir="rtl">
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>
          الدوران
          <span {...api().getValueTextProps()}>{api().value}°</span>
        </label>
        <div {...api().getControlProps()}>
          <div {...api().getThumbProps()} />
          <div {...api().getMarkerGroupProps()}>
            <Index each={MARKERS}>{(value) => <div {...api().getMarkerProps({ value: value() })} />}</Index>
          </div>
        </div>
        <input {...api().getHiddenInputProps()} />
      </div>
    </main>
  )
}
