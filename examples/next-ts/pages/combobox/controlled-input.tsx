import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
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
  { label: "Angular", value: "angular" },
  { label: "Svelte", value: "svelte" },
  { label: "Preact", value: "preact" },
]

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [value, setValue] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [options, setOptions] = useState(frameworks)

  const collection = useMemo(
    () =>
      combobox.collection({
        items: options,
        itemToValue: (item) => item.value,
        itemToString: (item) => item.label,
      }),
    [options],
  )

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
    value,
    inputValue,
    onValueChange: (e) => {
      setValue(e.value)
      if (e.value.length > 0) {
        const item = frameworks.find((f) => f.value === e.value[0])
        if (item) setInputValue(item.label)
      }
    },
    onInputValueChange: ({ inputValue: v }) => {
      setInputValue(v)
      setOptions(frameworks.filter((item) => contains(item.label, v)))
    },
    onOpenChange: (e) => {
      if (e.reason === "trigger-click") {
        setOptions(frameworks)
      }
    },
    placeholder: "Type to search",
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <main className="combobox" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "320px" }}>
        <div style={{ fontSize: "0.875rem" }}>
          <strong>Value:</strong> {value.length > 0 ? value.join(", ") : "—"}
        </div>
        <div style={{ fontSize: "0.875rem" }}>
          <strong>Input (controlled):</strong> {inputValue || "—"}
        </div>

        <div>
          <label {...api.getLabelProps()}>Select framework</label>
          <div {...api.getControlProps()} style={{ display: "flex", marginTop: "4px" }}>
            <input
              data-testid="input"
              {...api.getInputProps()}
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
            {...api.getContentProps()}
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
            {options.map((item) => (
              <li
                data-testid={item.value}
                key={item.value}
                {...api.getItemProps({ item })}
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

        <button
          data-testid="set-search-button"
          onClick={() => setInputValue("vue")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#3182ce",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Set input to &quot;vue&quot; externally
        </button>
      </div>
    </main>
  )
}
