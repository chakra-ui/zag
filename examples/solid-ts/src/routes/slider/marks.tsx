import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Index, createMemo, createUniqueId } from "solid-js"
import "@styles/slider.css"

const marks = [
  { value: 0, label: "Low" },
  { value: 50, label: "Medium" },
  { value: 100, label: "High" },
]

export default function Page() {
  const service = useMachine(slider.machine, {
    id: createUniqueId(),
    name: "quality",
    defaultValue: [50],
    step: 50,
    thumbSize: 20,
    getAriaValueText: ({ value }) => marks.find((mark) => mark.value === value)?.label ?? String(value),
  })

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return (
    <main>
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Quality</label>
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
        <div {...api().getMarkerGroupProps()}>
          <For each={marks}>{(mark) => <span {...api().getMarkerProps({ value: mark.value })}>{mark.label}</span>}</For>
        </div>
      </div>
    </main>
  )
}
