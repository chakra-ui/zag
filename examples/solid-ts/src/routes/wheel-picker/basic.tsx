import * as wheelPicker from "@zag-js/wheel-picker"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
const collection = wheelPicker.collection({
  items: ["React", "Vue", "Angular", "Svelte", "Solid", "Preact"].map((label) => ({
    label,
    value: label.toLowerCase(),
  })),
})
export default function Page() {
  const service = useMachine(wheelPicker.machine, {
    id: createUniqueId(),
    collection,
    defaultValue: "react",
    name: "framework",
  })
  const api = createMemo(() => wheelPicker.connect(service, normalizeProps))
  return (
    <>
      <main class="wheel-picker">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Framework</label>
          <div {...api().getControlProps()}>
            <div {...api().getViewportProps()}>
              <ul {...api().getItemGroupProps()}>
                <For each={api().items}>
                  {({ item, index, key }) => <li {...api().getItemProps({ item, index })}>{item.label}</li>}
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
          <select {...api().getHiddenSelectProps()}>
            <For each={collection.items}>{(item) => <option value={item.value}>{item.label}</option>}</For>
          </select>
        </div>
        <output>Selected: {api().valueAsString}</output>
      </main>
      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
