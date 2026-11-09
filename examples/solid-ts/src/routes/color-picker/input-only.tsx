import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { PipetteIcon } from "lucide-solid"
import { createMemo, createUniqueId } from "solid-js"
import "@styles/color-picker.css"

export default function Page() {
  const service = useMachine(colorPicker.machine, {
    id: createUniqueId(),
    name: "color",
    defaultValue: colorPicker.parse("#f97316"),
  })

  const api = createMemo(() => colorPicker.connect(service, normalizeProps))

  return (
    <main class="color-picker">
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>
          Text color: <span {...api().getValueTextProps()}>{api().valueAsString}</span>
        </label>

        <div {...api().getControlProps()}>
          <div class="color-picker-swatch-preview">
            <div {...api().getTransparencyGridProps({ size: "8px" })} />
            <div {...api().getSwatchProps({ value: api().value })} />
          </div>
          <input {...api().getChannelInputProps({ channel: "hex" })} />
          <button {...api().getEyeDropperTriggerProps()}>
            <PipetteIcon size={16} />
          </button>
        </div>
      </div>
    </main>
  )
}
