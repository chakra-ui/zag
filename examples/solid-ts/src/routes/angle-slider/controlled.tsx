import * as angleSlider from "@zag-js/angle-slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import "@styles/angle-slider.css"

const PRESETS = [0, 90, 180, 270]

export default function Page() {
  const id = createUniqueId()
  const [value, setValue] = createSignal(45)

  const service = useMachine(angleSlider.machine, () => ({
    id,
    value: value(),
    onValueChange: (details) => setValue(details.value),
  }))

  const api = createMemo(() => angleSlider.connect(service, normalizeProps))

  return (
    <main class="angle-slider">
      <div class="angle-slider-layout">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>
            Rotation
            <span {...api().getValueTextProps()}>{api().value}°</span>
          </label>
          <div {...api().getControlProps()}>
            <div {...api().getThumbProps()} />
          </div>
          <input {...api().getHiddenInputProps()} />
        </div>

        <div class="angle-slider-presets">
          <For each={PRESETS}>
            {(preset) => (
              <button aria-pressed={value() === preset} onClick={() => setValue(preset)}>
                {preset}°
              </button>
            )}
          </For>
          <input
            type="number"
            aria-label="Rotation in degrees"
            min={0}
            max={359}
            value={value()}
            onInput={(event) => {
              const next = event.currentTarget.valueAsNumber
              setValue(Number.isNaN(next) ? 0 : Math.min(359, Math.max(0, next)))
            }}
          />
        </div>
      </div>
    </main>
  )
}
