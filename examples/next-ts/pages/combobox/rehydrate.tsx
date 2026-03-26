import styles from "../../../../shared/src/css/combobox.module.css"
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
    async load({ signal, filterText }) {
      const response = await fetch(`https://swapi.py4e.com/api/people/?search=${filterText}`, { signal })
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
      asyncList.setFilterText(inputValue)
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
      <div {...api.getRootProps()} className={styles.Root}>
        <label {...api.getLabelProps()} className={styles.Label}>Select country</label>
        <div {...api.getControlProps()} className={styles.Control}>
          <input data-testid="input" {...api.getInputProps()} className={styles.Input} />
          <button data-testid="trigger" {...api.getTriggerProps()}>
            ▼
          </button>
          <button {...api.getClearTriggerProps()} className={styles.ClearTrigger}>
            <XIcon />
          </button>
        </div>
      </div>
      <div {...api.getPositionerProps()}>
        {api.collection.items.length > 0 && (
          <ul data-testid="combobox-content" {...api.getContentProps()} className={styles.Content}>
            {api.collection.items.map((item) => (
              <li data-testid={item.name} key={item.name} {...api.getItemProps({ item })} className={styles.Item}>
                <span {...api.getItemIndicatorProps({ item })}>✅</span>
                <span>{item.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
