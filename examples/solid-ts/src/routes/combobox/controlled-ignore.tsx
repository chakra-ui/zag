import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createUniqueId } from "solid-js"
import "@styles/combobox.css"

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
  // controller ignores selection changes; value is always ["react"]
  const value = ["react"]

  const collection = combobox.collection({
    items,
    itemToValue: (item) => item.value,
    itemToString: (item) => item.label,
  })

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: createUniqueId(),
    collection,
    value,
    multiple: true,
    openOnClick: true,
  })

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <main class="combobox" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", "flex-direction": "column", gap: "1rem", "max-width": "320px" }}>
        <div style={{ "font-size": "0.875rem" }}>
          <strong>Value (controlled, fixed):</strong> {value.join(", ")}
        </div>
        <div data-testid="selected-items" style={{ "font-size": "0.875rem" }}>
          <strong>Selected items (from api):</strong>{" "}
          {api()
            .selectedItems.map((item) => (typeof item === "string" ? item : item.label))
            .join(", ")}
        </div>
        <div style={{ "font-size": "0.75rem", color: "#666" }}>
          Expected: both should show "React". Bug: selectedItems may show "React, Vue" after selecting Vue.
        </div>

        <div>
          <label {...api().getLabelProps()}>Select framework</label>
          <div {...api().getControlProps()} style={{ display: "flex", "margin-top": "4px" }}>
            <input
              data-testid="input"
              {...api().getInputProps()}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid #ccc",
                "border-radius": "4px",
              }}
            />
            <button data-testid="trigger" {...api().getTriggerProps()} style={{ padding: "8px" }}>
              ▼
            </button>
          </div>
        </div>

        <div {...api().getPositionerProps()}>
          <div
            data-testid="combobox-content"
            {...api().getContentProps()}
            style={{
              "list-style": "none",
              margin: 0,
              padding: "4px",
              border: "1px solid #ccc",
              "border-radius": "4px",
              "margin-top": "4px",
              "max-height": "200px",
              overflow: "auto",
            }}
          >
            <div {...api().getListProps()}>
              <For each={items}>
                {(item) => (
                  <div
                    data-testid={item.value}
                    {...api().getItemProps({ item })}
                    style={{ padding: "8px 12px", cursor: "pointer" }}
                  >
                    {item.label}
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
