import * as asyncList from "@zag-js/async-list"
import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { Index, Show, createEffect, createMemo, createUniqueId } from "solid-js"
import "@styles/combobox.css"

interface Item {
  name: string
  height: string
  mass: string
  created: string
  edited: string
  url: string
}

export default function Page() {
  const listService = useMachine(asyncList.machine as asyncList.Machine<Item>, {
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
  const list = createMemo(() => asyncList.connect(listService))

  const collection = createMemo(() =>
    combobox.collection({
      items: list().items,
      itemToValue: (item) => item.name,
      itemToString: (item) => item.name,
    }),
  )

  const id = createUniqueId()

  const service = useMachine(combobox.machine as combobox.Machine<Item>, (): combobox.Props<Item> => ({
    id,
    collection: collection(),
    defaultValue: ["C-3PO"],
    placeholder: "Example: Dexter",
    onInputValueChange({ inputValue }) {
      list().setFilter(inputValue)
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  let hydrated = false
  createEffect(() => {
    if (hydrated) return
    if (api().value.length && api().collection.size) {
      api().syncSelectedItems()
      hydrated = true
    }
  })

  return (
    <main class="combobox">
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Select country</label>
        <div {...api().getControlProps()}>
          <input data-testid="input" {...api().getInputProps()} />
          <button data-testid="trigger" {...api().getTriggerProps()}>
            ▼
          </button>
          <button {...api().getClearTriggerProps()}>
            <XIcon />
          </button>
        </div>
      </div>
      <div {...api().getPositionerProps()}>
        <div data-testid="combobox-content" {...api().getContentProps()}>
          <Show when={api().collection.items.length > 0}>
            <div {...api().getListProps()}>
              <Index each={api().collection.items}>
                {(item) => (
                  <div data-testid={item().name} {...api().getItemProps({ item: item() })}>
                    <span {...api().getItemIndicatorProps({ item: item() })}>✅</span>
                    <span>{item().name}</span>
                  </div>
                )}
              </Index>
            </div>
          </Show>
        </div>
      </div>
    </main>
  )
}
