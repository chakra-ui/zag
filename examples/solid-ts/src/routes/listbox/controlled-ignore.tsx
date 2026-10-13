import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
import "@styles/listbox.css"

interface Item {
  label: string
  value: string
}

const items: Item[] = [
  { label: "React", value: "react" },
  { label: "Vue", value: "vue" },
  { label: "Solid", value: "solid" },
]

export default function Page() {
  const value = ["react"]

  const collection = listbox.collection({
    items,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  })

  const service = useMachine(listbox.machine as listbox.Machine<Item>, {
    id: createUniqueId(),
    collection,
    value,
    selectionMode: "multiple",
  })

  const api = createMemo(() => listbox.connect(service, normalizeProps))

  return (
    <main class="listbox" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", "flex-direction": "column", gap: "1rem", "max-width": "320px" }}>
        <div style={{ "font-size": "0.875rem" }}>
          <strong>Value (controlled, fixed):</strong> {value.join(", ")}
        </div>
        <div data-testid="selected-items" style={{ "font-size": "0.875rem" }}>
          <strong>Selected items (from api):</strong>{" "}
          {api()
            .selectedItems.map((item) => item.label)
            .join(", ")}
        </div>
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Select framework</label>
          <div data-testid="listbox-content" {...api().getContentProps()}>
            <ul {...api().getListProps()}>
              <For each={items}>
                {(item) => (
                  <li data-testid={item.value} {...api().getItemProps({ item })}>
                    <span {...api().getItemTextProps({ item })}>{item.label}</span>
                    <span {...api().getItemIndicatorProps({ item })}>✓</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
