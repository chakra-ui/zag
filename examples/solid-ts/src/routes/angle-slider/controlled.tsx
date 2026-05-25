import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/angle-slider.css"

export default function Page() {
  const id = createUniqueId()
  const [value, setValue] = createSignal(45)

  const service = useMachine(angleSlider.machine, () => ({
    id,
    value: value(),
    onValueChange(details) {
      setValue(details.value)
    },
  }))

  const api = createMemo(() => angleSlider.connect(service, normalizeProps))

  return (
    <main class="angle-slider">
      <h1>Angle Slider — Controlled</h1>
      <div style={{ display: "flex", gap: "12px", "align-items": "center", "margin-bottom": "16px" }}>
        <input
          type="number"
          min={0}
          max={359}
          value={value()}
          onInput={(event) => {
            const next = event.currentTarget.valueAsNumber
            setValue(Number.isNaN(next) ? 0 : Math.min(359, Math.max(0, next)))
          }}
        />
        <button type="button" onClick={() => setValue(0)}>
          Reset
        </button>
      </div>
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
