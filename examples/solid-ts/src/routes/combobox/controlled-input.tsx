import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { Index, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/combobox.css"

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
  const [value, setValue] = createSignal<string[]>([])
  const [inputValue, setInputValue] = createSignal("")
  const [options, setOptions] = createSignal(frameworks)

  const collection = createMemo(() =>
    combobox.collection({
      items: options(),
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
    }),
  )

  const id = createUniqueId()

  const service = useMachine(combobox.machine as combobox.Machine<Item>, (): combobox.Props<Item> => ({
    id,
    collection: collection(),
    value: value(),
    inputValue: inputValue(),
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
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <main class="combobox" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", "flex-direction": "column", gap: "1rem", "max-width": "320px" }}>
        <div style={{ "font-size": "0.875rem" }}>
          <strong>Value:</strong> {value().length > 0 ? value().join(", ") : "—"}
        </div>
        <div style={{ "font-size": "0.875rem" }}>
          <strong>Input (controlled):</strong> {inputValue() || "—"}
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
              <Index each={options()}>
                {(item) => (
                  <div
                    data-testid={item().value}
                    {...api().getItemProps({ item: item() })}
                    style={{
                      padding: "8px 12px",
                      cursor: "pointer",
                    }}
                  >
                    {item().label}
                  </div>
                )}
              </Index>
            </div>
          </div>
        </div>

        <button
          data-testid="set-search-button"
          onClick={() => setInputValue("vue")}
          style={{
            padding: "8px 16px",
            "background-color": "#3182ce",
            color: "white",
            border: "none",
            "border-radius": "4px",
            cursor: "pointer",
          }}
        >
          Set input to &quot;vue&quot; externally
        </button>
      </div>
    </main>
  )
}
