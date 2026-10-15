import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, Index } from "solid-js"
import "@styles/angle-slider.css"

const STEP = 45
const MARKERS = [0, 45, 90, 135, 180, 225, 270, 315]
const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]

export default function Page() {
  const service = useMachine(angleSlider.machine, { id: createUniqueId(), step: STEP })
  const api = createMemo(() => angleSlider.connect(service, normalizeProps))

  return (
    <main class="angle-slider">
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>
          Wind direction
          <span {...api().getValueTextProps()}>
            {api().value}° {DIRECTIONS[Math.round(api().value / STEP) % DIRECTIONS.length]}
          </span>
        </label>
        <div {...api().getControlProps()}>
          <div class="angle-slider-compass" aria-hidden="true">
            <span>N</span>
            <span>E</span>
            <span>S</span>
            <span>W</span>
          </div>
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
