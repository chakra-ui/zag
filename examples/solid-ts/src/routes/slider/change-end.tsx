import { normalizeProps, useMachine } from "@zag-js/solid"
import * as slider from "@zag-js/slider"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/slider.css"

export default function Page() {
  const [value, setValue] = createSignal([50])
  const [endValue, setEndValue] = createSignal([50])

  const service = useMachine(slider.machine, {
    thumbSize: 20,
    id: createUniqueId(),
    name: "quantity",
    defaultValue: [50],
    onValueChange(details) {
      setValue(details.value)
    },
    onValueChangeEnd(details) {
      setEndValue(details.value)
    },
  })

  const api = createMemo(() => slider.connect(service, normalizeProps))

  return (
    <main>
      <div {...api().getRootProps()}>
        <div {...api().getControlProps()}>
          <div data-testid="track" {...api().getTrackProps()}>
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

        <div style={{ display: "flex", gap: "16px" }}>
          <output>Change: {value()[0]}</output>
          <output>Change end: {endValue()[0]}</output>
        </div>
      </div>
    </main>
  )
}
