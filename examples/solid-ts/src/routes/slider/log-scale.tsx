import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
import "@styles/slider.css"

export default function Page() {
  const service = useMachine(slider.machine, {
    id: createUniqueId(),
    name: "frequency",
    defaultValue: [440],
    min: 20,
    max: 20000,
    thumbSize: 20,
    scale: "log",
  })

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return (
    <main>
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Frequency</label>
        <output {...api().getValueTextProps()}>{api().getThumbValue(0)} Hz</output>
        <div {...api().getControlProps()}>
          <div {...api().getTrackProps()}>
            <div {...api().getRangeProps()} />
          </div>
          <For keyed={false} each={api().value}>
            {(_, index) => (
              <div {...api().getThumbProps({ index })}>
                <input {...api().getHiddenInputProps({ index })} />
              </div>
            )}
          </For>
        </div>
      </div>
    </main>
  )
}
