import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useMemo, useState } from "react"

interface Item {
  label: string
  value: string
}

const frameworks: Item[] = [
  { label: "React", value: "react" },
  { label: "Solid", value: "solid" },
  { label: "Vue", value: "vue" },
]

export default function Page() {
  const [value, setValue] = useState<string[]>(["react"])
  const [options, setOptions] = useState(frameworks)

  const collection = useMemo(
    () =>
      listbox.collection({
        items: options,
        itemToValue: (item) => item.value,
        itemToString: (item) => item.label,
      }),
    [options],
  )

  const service = useMachine(listbox.machine as listbox.Machine<Item>, {
    id: useId(),
    collection,
    value,
    onValueChange: (e) => setValue(e.value),
  })

  const api = listbox.connect(service, normalizeProps)

  return (
    <main className="listbox" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "320px" }}>
        <div data-testid="selected-items" style={{ fontSize: "0.875rem" }}>
          <strong>Selected items (from api):</strong> {api.selectedItems.map((item) => item.label).join(", ")}
        </div>
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Select framework</label>
          <ul data-testid="listbox-content" {...api.getContentProps()}>
            {options.map((item) => (
              <li key={item.value} data-testid={item.value} {...api.getItemProps({ item })}>
                <span {...api.getItemTextProps({ item })}>{item.label}</span>
                <span {...api.getItemIndicatorProps({ item })}>✓</span>
              </li>
            ))}
          </ul>
        </div>

        <button data-testid="filter-vue-button" onClick={() => setOptions([frameworks[2]])}>
          Filter to Vue
        </button>
        <button
          data-testid="set-solid-button"
          onClick={() => {
            setOptions(frameworks)
            setValue(["solid"])
          }}
        >
          Set value to Solid
        </button>
      </div>
    </main>
  )
}
