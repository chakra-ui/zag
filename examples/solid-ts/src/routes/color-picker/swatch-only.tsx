import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { CheckIcon } from "lucide-solid"
import { For, createMemo, createUniqueId } from "solid-js"
import "@styles/color-picker.css"

const swatches = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#64748b"]

export default function Page() {
  const service = useMachine(colorPicker.machine, {
    id: createUniqueId(),
    name: "color",
    defaultValue: colorPicker.parse("#22c55e"),
  })

  const api = createMemo(() => colorPicker.connect(service, normalizeProps))

  return (
    <main class="color-picker">
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>
          Label color: <span {...api().getValueTextProps()}>{api().valueAsString}</span>
        </label>

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
    </main>
  )
}
