import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"

const presets = ["#f47373", "#697689", "#37d67a"]

export default function Page() {
  let nextFieldRef: HTMLInputElement | undefined
  const service = useMachine(colorPicker.machine, {
    id: createUniqueId(),
    closeOnSelect: true,
    defaultValue: colorPicker.parse("#ff0000"),
    onValueChange() {
      nextFieldRef?.focus()
    },
  })
  const api = createMemo(() => colorPicker.connect(service, normalizeProps))
  return (
    <main class="color-picker">
      <div {...api().getRootProps()}>
        <div {...api().getControlProps()}>
          <button {...api().getTriggerProps()}>
            <div {...api().getSwatchProps({ value: api().value })} />
          </button>
        </div>
        <input ref={nextFieldRef} data-testid="next-field" placeholder="Next field" />
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div {...api().getSwatchGroupProps()} style={{ display: "flex", gap: "8px" }}>
              <For each={presets}>
                {(preset) => (
                  <button {...api().getSwatchTriggerProps({ value: preset })}>
                    <div {...api().getSwatchProps({ value: preset })} style={{ width: "20px", height: "20px" }} />
                  </button>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
