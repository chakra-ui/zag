import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useMemo } from "react"

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

  const collection = useMemo(
    () =>
      listbox.collection({
        items,
        itemToValue: (item) => item.value,
        itemToString: (item) => item.label,
      }),
    [],
  )

  const service = useMachine(listbox.machine as listbox.Machine<Item>, {
    id: useId(),
    collection,
    value,
    selectionMode: "multiple",
  })

  const api = listbox.connect(service, normalizeProps)

  return (
    <main className="listbox" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "320px" }}>
        <div style={{ fontSize: "0.875rem" }}>
          <strong>Value (controlled, fixed):</strong> {value.join(", ")}
        </div>
        <div data-testid="selected-items" style={{ fontSize: "0.875rem" }}>
          <strong>Selected items (from api):</strong> {api.selectedItems.map((item) => item.label).join(", ")}
        </div>
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Select framework</label>
          <div data-testid="listbox-content" {...api.getContentProps()}>
            <ul {...api.getListProps()}>
              {items.map((item) => (
                <li key={item.value} data-testid={item.value} {...api.getItemProps({ item })}>
                  <span {...api.getItemTextProps({ item })}>{item.label}</span>
                  <span {...api.getItemIndicatorProps({ item })}>✓</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
