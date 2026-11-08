import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { CheckIcon } from "lucide-solid"
import { For, createMemo, createUniqueId } from "solid-js"
import "@styles/color-picker.css"

const swatches = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#64748b",
]

export default function Page() {
  const service = useMachine(colorPicker.machine, {
    id: createUniqueId(),
    name: "color",
    defaultValue: colorPicker.parse("#3b82f6"),
    closeOnSelect: true,
  })

  const api = createMemo(() => colorPicker.connect(service, normalizeProps))

  return (
    <main class="color-picker">
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Brand color</label>

        <div {...api().getControlProps()}>
          <button {...api().getTriggerProps()}>
            <div {...api().getTransparencyGridProps({ size: "10px" })} />
            <div {...api().getSwatchProps({ value: api().value })} />
          </button>
          <input {...api().getChannelInputProps({ channel: "hex" })} />
        </div>

        <div {...api().getPositionerProps()}>
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

              <div {...api().getSwatchGroupProps()} class="color-picker-swatches">
                <For each={swatches}>
                  {(swatch) => (
                    <button {...api().getSwatchTriggerProps({ value: swatch })} class="color-picker-swatch-button">
                      <div {...api().getSwatchProps({ value: swatch })} />
                      <span {...api().getSwatchIndicatorProps({ value: swatch })}>
                        <CheckIcon size={16} />
                      </span>
                    </button>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
