import styles from "../../../../shared/src/css/combobox.module.css"
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
  { label: "Qwik", value: "qwik" },
  { label: "Lit", value: "lit" },
  { label: "Alpine.js", value: "alpinejs" },
  { label: "Ember", value: "ember" },
  { label: "Next.js", value: "nextjs" },
]

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [value, setValue] = useState<string[]>(["react"])
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
    onValueChange: (e) => setValue(e.value),
    onOpenChange: () => {
      setOptions(frameworks)
    },
    onInputValueChange: ({ inputValue }) => {
      const filtered = frameworks.filter((item) => contains(item.label, inputValue))
      setOptions(filtered.length > 0 ? filtered : frameworks)
    },
    placeholder: "Type to search",
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <main className="combobox" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "320px" }}>
        <div style={{ fontSize: "0.875rem" }}>
          <strong>Selected:</strong> {value.length > 0 ? value.join(", ") : "N/A"}
          <pre style={{ maxWidth: 400, overflow: "auto" }}>{JSON.stringify(collection.toString(), null, 2)}</pre>
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
            {options.map((item) => (
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

        <button
          data-testid="set-solid-button"
          onClick={() => {
            setOptions(frameworks)
            setValue(["solid"])
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: "#3182ce",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Set value to &quot;Solid&quot; externally
        </button>
      </div>
    </main>
  )
}
