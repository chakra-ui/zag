import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useMemo, useState } from "react"
import { useAsyncList } from "../../hooks/use-async-list"

interface Item {
  name: string
  url: string
}

export default function Page() {
  const [selected, setSelected] = useState<string[]>([])

  const asyncList = useAsyncList<Item>({
    autoReload: true,
    async load({ signal, filter }) {
      const response = await fetch(`https://swapi.py4e.com/api/people/?search=${filter ?? ""}`, { signal })
      const data = await response.json()
      return {
        items: data.results ?? [],
        cursor: data.next ?? null,
      }
    },
  })

  const collection = useMemo(
    () =>
      combobox.collection({
        items: asyncList.items,
        itemToValue: (item) => item.name,
        itemToString: (item) => item.name,
      }),
    [asyncList.items],
  )

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
    placeholder: "Search people...",
    onInputValueChange({ inputValue }) {
      asyncList.setFilter(inputValue)
    },
    onValueChange({ value }) {
      setSelected(value)
    },
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <main className="combobox" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "360px" }}>
        <div data-testid="selected-value" style={{ fontSize: "0.875rem" }}>
          <strong>Selected:</strong> {selected.join(", ")}
        </div>

        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Search Star Wars characters</label>
          <div {...api.getControlProps()} style={{ display: "flex", marginTop: "4px" }}>
            <input data-testid="input" {...api.getInputProps()} style={{ flex: 1, padding: "8px 12px" }} />
            <button data-testid="trigger" {...api.getTriggerProps()} style={{ padding: "8px" }}>
              ▼
            </button>
          </div>
        </div>

        {asyncList.isLoading && (
          <div data-testid="loading" style={{ fontSize: "0.875rem" }}>
            Loading...
          </div>
        )}

        <div {...api.getPositionerProps()}>
          <div data-testid="combobox-content" {...api.getContentProps()} style={{ listStyle: "none", padding: "4px" }}>
            {api.collection.items.length > 0 && (
              <div {...api.getListProps()}>
                {api.collection.items.map((item) => (
                  <div
                    key={item.name}
                    data-testid={`item-${item.name}`}
                    {...api.getItemProps({ item })}
                    style={{ padding: "8px 12px", cursor: "pointer" }}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
