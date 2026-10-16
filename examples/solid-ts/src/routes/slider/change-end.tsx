import * as slider from "@zag-js/slider"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import { Output } from "~/components/output"
import "@styles/slider.css"

export default function Page() {
  const [value, setValue] = createSignal([50])
  const [endValue, setEndValue] = createSignal([50])

  const service = useMachine(slider.machine, {
    id: createUniqueId(),
    name: "brightness",
    defaultValue: [50],
    thumbSize: 20,
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
        <label {...api().getLabelProps()}>Brightness</label>
        <output {...api().getValueTextProps()}>{api().value}</output>
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
      <div class="hstack gap-4">
        <Output label="onValueChange" value={value()[0]} />
        <Output label="onValueChangeEnd" value={endValue()[0]} />
      </div>
    </main>
  )
}
