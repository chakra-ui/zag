import * as radio from "@zag-js/radio-group"
import { planOptions } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/radio-group.css"

export default function Page() {
  const [value, setValue] = createSignal<string | null>("free")

  const service = useMachine(radio.machine, () => ({
    id: createUniqueId(),
    name: "plan",
    value: value(),
    onValueChange: (details: radio.ValueChangeDetails) => setValue(details.value),
  }))

  const api = createMemo(() => radio.connect(service, normalizeProps))
  const selected = () => planOptions.find((plan) => plan.id === value())

  return (
    <>
      <main>
        <div class="plan-picker">
          <p class="hint">Pick a plan, or use the button to switch to Team.</p>
          <div {...api().getRootProps()}>
            <span {...api().getLabelProps()}>Plan</span>
            <For each={planOptions}>
              {(opt) => (
                <label
                  data-testid={`radio-${opt.id}`}
                  {...api().getItemProps({ value: opt.id, disabled: opt.disabled })}
                >
                  <div {...api().getItemControlProps({ value: opt.id, disabled: opt.disabled })} />
                  <span {...api().getItemTextProps({ value: opt.id, disabled: opt.disabled })}>
                    <span class="name">{opt.label}</span>
                    <span class="price">{opt.price}</span>
                    <span class="detail">{opt.note}</span>
                  </span>
                  <input {...api().getItemHiddenInputProps({ value: opt.id, disabled: opt.disabled })} />
                </label>
              )}
            </For>
          </div>
          <p class="selected" data-testid="selected-plan" role="status">
            Selected plan: {selected()?.label ?? "None"}
          </p>
          <div class="actions">
            <button type="button" onClick={() => setValue("team")}>
              Switch to Team
            </button>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
