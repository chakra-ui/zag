import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { XIcon } from "lucide-react"
import { useId, useMemo, useRef } from "react"
import { useAsyncList } from "../../hooks/use-async-list"

interface Item {
  name: string
  height: string
  mass: string
  created: string
  edited: string
  url: string
}

export default function Page() {
  const asyncList = useAsyncList<Item>({
    autoReload: true,
    async load({ signal, filter }) {
      const response = await fetch(`https://swapi.py4e.com/api/people/?search=${filter}`, { signal })
      const data = await response.json()
      return {
        items: data.results,
        cursor: data.next,
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
    defaultValue: ["C-3PO"],
    placeholder: "Example: Dexter",
    onInputValueChange({ inputValue }) {
      asyncList.setFilter(inputValue)
    },
  })

  const api = combobox.connect(service, normalizeProps)

  const hydrated = useRef(false)
  if (api.value.length && api.collection.size && !hydrated.current) {
    api.syncSelectedItems()
    hydrated.current = true
  }

  return (
    <main className="combobox">
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Select country</label>
        <div {...api.getControlProps()}>
          <input data-testid="input" {...api.getInputProps()} />
          <button data-testid="trigger" {...api.getTriggerProps()}>
            ▼
          </button>
          <button {...api.getClearTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>
      <div {...api.getPositionerProps()}>
        <div data-testid="combobox-content" {...api.getContentProps()}>
          {api.collection.items.length > 0 && (
            <div {...api.getListProps()}>
              {api.collection.items.map((item) => (
                <div data-testid={item.name} key={item.name} {...api.getItemProps({ item })}>
                  <span {...api.getItemIndicatorProps({ item })}>✅</span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
