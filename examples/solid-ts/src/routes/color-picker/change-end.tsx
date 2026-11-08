import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/color-picker.css"

const initialValue = colorPicker.parse("hsl(210, 90%, 55%)")

export default function Page() {
  const [liveValue, setLiveValue] = createSignal(initialValue.toString("hex"))
  const [endValue, setEndValue] = createSignal(initialValue.toString("hex"))

  const service = useMachine(colorPicker.machine, {
    id: createUniqueId(),
    inline: true,
    defaultValue: initialValue,
    onValueChange: (details) => setLiveValue(details.value.toString("hex")),
    onValueChangeEnd: (details) => setEndValue(details.value.toString("hex")),
  })

  const api = createMemo(() => colorPicker.connect(service, normalizeProps))

  return (
    <main class="color-picker">
      <div {...api().getRootProps()}>
        <div {...api().getContentProps()}>
          <div class="content__inner">
            <div {...api().getAreaProps()}>
              <div {...api().getAreaBackgroundProps()} />
              <div {...api().getAreaThumbProps()} />
            </div>

            <div {...api().getChannelSliderProps({ channel: "hue" })}>
              <div {...api().getChannelSliderTrackProps({ channel: "hue" })} />
              <div {...api().getChannelSliderThumbProps({ channel: "hue" })} />
            </div>
          </div>
        </div>
      </div>

      <div class="color-picker-readouts">
        <span>onValueChange</span>
        <output aria-label="Live value">{liveValue()}</output>
        <span>onValueChangeEnd</span>
        <output aria-label="Committed value">{endValue()}</output>
      </div>
    </main>
  )
}
