import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Index, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/slider.css"

const presets = [0, 25, 50, 100]

export default function Page() {
  const [value, setValue] = createSignal([25])

  const id = createUniqueId()
  const service = useMachine(slider.machine, () => ({
    id,
    name: "zoom",
    value: value(),
    thumbSize: 20,
    onValueChange(details) {
      setValue(details.value)
    },
  }))

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return (
    <main>
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Zoom</label>
        <output {...api().getValueTextProps()}>{value()[0]}%</output>
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
            <button type="button" onClick={() => setValue([preset])}>
              {preset}%
            </button>
          )}
        </For>
      </div>
    </main>
  )
}
