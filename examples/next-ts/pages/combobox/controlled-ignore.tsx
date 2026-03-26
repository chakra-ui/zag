import styles from "../../../../shared/src/css/combobox.module.css"
import * as combobox from "@zag-js/combobox"
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
  // Controller IGNORES selection changes - value is always ["react"]
  const value = ["react"]

  const collection = useMemo(
    () =>
      combobox.collection({
        items,
        itemToValue: (item) => item.value,
        itemToString: (item) => item.label,
      }),
    [],
  )

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
    value,
    multiple: true,
    openOnClick: true,
    // Intentionally NOT passing onValueChange - controller ignores all changes
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <main className="combobox" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "320px" }}>
        <div style={{ fontSize: "0.875rem" }}>
          <strong>Value (controlled, fixed):</strong> {value.join(", ")}
        </div>
        <div data-testid="selected-items" style={{ fontSize: "0.875rem" }}>
          <strong>Selected items (from api):</strong>{" "}
          {api.selectedItems.map((item) => (typeof item === "string" ? item : item.label)).join(", ")}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#666" }}>
          Expected: both should show &quot;React&quot;. Bug: selectedItems may show &quot;React, Vue&quot; after
          selecting Vue.
        </div>

        <div>
          <label {...api.getLabelProps()} className={styles.Label}>Select framework</label>
          <div {...api.getControlProps()} className={styles.Control} style={{ display: "flex", marginTop: "4px" }}>
            <input
              data-testid="input"
              {...api.getInputProps()} className={styles.Input}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <button data-testid="trigger" {...api.getTriggerProps()} style={{ padding: "8px" }}>
              ▼
            </button>
          </div>
        </div>

        <div {...api.getPositionerProps()}>
          <ul
            data-testid="combobox-content"
            {...api.getContentProps()} className={styles.Content}
            style={{
              listStyle: "none",
              margin: 0,
              padding: "4px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "4px",
              maxHeight: "200px",
              overflow: "auto",
            }}
          >
            {items.map((item) => (
              <li
                data-testid={item.value}
                key={item.value}
                {...api.getItemProps({ item })} className={styles.Item}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                }}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
