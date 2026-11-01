import * as select from "@zag-js/select"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronsUpDownIcon } from "lucide-solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/select.css"

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
  const [value, setValue] = createSignal<string[]>(["react"])
  const [options, setOptions] = createSignal(frameworks)

  const collection = createMemo(() =>
    select.collection({
      items: options(),
      itemToValue: (item) => item.value,
      itemToString: (item) => item.label,
    }),
  )

  const id = createUniqueId()
  const service = useMachine(select.machine as select.Machine<Item>, () => ({
    id,
    collection: collection(),
    value: value(),
    onValueChange: (e) => setValue(e.value),
  }))

  const api = createMemo(() => select.connect(service, normalizeProps))

  return (
    <main class="select" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", "flex-direction": "column", gap: "1rem", "max-width": "320px" }}>
        <div data-testid="selected-items" style={{ "font-size": "0.875rem" }}>
          <strong>Selected items (from api):</strong>{" "}
          {api()
            .selectedItems.map((item) => item.label)
            .join(", ")}
        </div>

        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Select framework</label>
          <div {...mergeProps(api().getControlProps(), { style: { display: "flex", "margin-top": "4px" } })}>
            <button data-testid="trigger" {...mergeProps(api().getTriggerProps(), { style: { flex: 1 } })}>
              <span>{api().valueAsString || "Select option"}</span>
              <span {...api().getIndicatorProps()}>
                <ChevronsUpDownIcon />
              </span>
            </button>
          </div>

          <Portal>
            <div {...api().getPositionerProps()}>
              <div data-testid="select-content" {...mergeProps(api().getContentProps(), { style: { padding: "4px" } })}>
                <div {...api().getListProps()}>
                  <For each={options()}>
                    {(item) => (
                      <div data-testid={item.value} {...api().getItemProps({ item })} style={{ padding: "8px 12px" }}>
                        <span {...api().getItemTextProps({ item })}>{item.label}</span>
                        <span {...api().getItemIndicatorProps({ item })}>✓</span>
                      </div>
                    )}
                  </For>
                </div>
              </div>
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
