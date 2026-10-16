import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Index, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/slider.css"

const presets = [
  { label: "Any", value: [0, 1000] },
  { label: "Under $250", value: [0, 250] },
  { label: "$250 – $500", value: [250, 500] },
  { label: "$500+", value: [500, 1000] },
]

export default function Page() {
  const [value, setValue] = createSignal([200, 600])

  const id = createUniqueId()
  const service = useMachine(slider.machine, () => ({
    id,
    name: "price",
    value: value(),
    min: 0,
    max: 1000,
    step: 10,
    thumbSize: 20,
    "aria-label": ["Minimum price", "Maximum price"],
    onValueChange(details) {
      setValue(details.value)
    },
  }))

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return (
    <main>
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Price</label>
        <output {...api().getValueTextProps()}>
          ${value()[0]} – ${value()[1]}
        </output>
        <div {...api().getControlProps()}>
          <div {...api().getTrackProps()}>
            <div {...api().getRangeProps()} />
          </div>
          <Index each={api().value}>
            {(_, index) => (
              <div {...api().getThumbProps({ index })}>
                <input {...api().getHiddenInputProps({ index })} />
              </div>
            )}
          </Index>
        </div>
      </div>
      <div class="hstack">
        <For each={presets}>
          {(preset) => (
            <button type="button" onClick={() => setValue(preset.value)}>
              {preset.label}
            </button>
          )}
        </For>
      </div>
    </main>
  )
}
