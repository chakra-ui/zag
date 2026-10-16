import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, Index, createMemo, createUniqueId } from "solid-js"
import "@styles/slider.css"

const marks = [0, 25, 50, 75, 100]

export default function Page() {
  const service = useMachine(slider.machine, {
    id: createUniqueId(),
    name: "quantity",
    defaultValue: [20, 60],
    thumbSize: 20,
    "aria-label": ["Minimum quantity", "Maximum quantity"],
  })

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return (
    <main>
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Quantity</label>
        <output {...api().getValueTextProps()}>{api().value.join(" – ")}</output>
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
          <For each={marks}>{(value) => <span {...api().getMarkerProps({ value })}>{value}</span>}</For>
        </div>
      </div>
    </main>
  )
}
