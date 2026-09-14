import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
const collection = wheelPicker.collection({
  items: ["React", "Vue", "Angular", "Svelte", "Solid"].map((label) => ({ label, value: label.toLowerCase() })),
})
export default function Page() {
  const [value, setValue] = createSignal("react")
  const service = useMachine(wheelPicker.machine, () => ({
    id: createUniqueId(),
    collection,
    value: value(),
    onValueChange: ({ value }) => setValue(value ?? "react"),
  }))
  const api = createMemo(() => wheelPicker.connect(service, normalizeProps))
  return (
    <main class="wheel-picker">
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Framework</label>
        <div {...api().getControlProps()}>
          <div {...api().getViewportProps()}>
            <ul {...api().getItemGroupProps()}>
              <For each={api().items}>
                {({ item, index }) => <li {...api().getItemProps({ item, index })}>{item.label}</li>}
              </For>
            </ul>
            <div {...api().getHighlightProps()}>
              <ul {...api().getHighlightItemGroupProps()}>
                <For each={api().highlightItems}>
                  {({ item, index }) => <li {...api().getHighlightItemProps({ item, index })}>{item.label}</li>}
                </For>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="wheel-picker-actions">
        <button onClick={() => setValue("react")}>Select React</button>
        <button onClick={() => setValue("svelte")}>Select Svelte</button>
      </div>
      <output>Controlled value: {api().valueAsString}</output>
    </main>
  )
}
