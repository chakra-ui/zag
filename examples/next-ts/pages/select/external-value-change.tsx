import * as select from "@zag-js/select"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
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
      select.collection({
        items: options,
        itemToValue: (item) => item.value,
        itemToString: (item) => item.label,
      }),
    [options],
  )

  const service = useMachine(select.machine as select.Machine<Item>, {
    id: useId(),
    collection,
    value,
    onValueChange: (e) => setValue(e.value),
  })

  const api = select.connect(service, normalizeProps)

  return (
    <main className="select" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "320px" }}>
        <div data-testid="selected-items" style={{ fontSize: "0.875rem" }}>
          <strong>Selected items (from api):</strong> {api.selectedItems.map((item) => item.label).join(", ")}
        </div>

        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Select framework</label>
          <div {...api.getControlProps()} style={{ display: "flex", marginTop: "4px" }}>
            <button data-testid="trigger" {...api.getTriggerProps()} style={{ padding: "8px 12px", flex: 1 }}>
              <span>{api.valueAsString || "Select option"}</span>
              <span style={{ marginLeft: "8px" }}>▼</span>
            </button>
          </div>

          <Portal>
            <div {...api.getPositionerProps()}>
              <ul data-testid="select-content" {...api.getContentProps()} style={{ listStyle: "none", padding: "4px" }}>
                {options.map((item) => (
                  <li
                    key={item.value}
                    data-testid={item.value}
                    {...api.getItemProps({ item })}
                    style={{ padding: "8px 12px" }}
                  >
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </li>
                ))}
              </ul>
            </div>
          </Portal>
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
