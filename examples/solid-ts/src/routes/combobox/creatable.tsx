import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/combobox.css"

interface Item {
  label: string
  value: string
}

const toItem = (label: string): Item => ({ label, value: label.toLowerCase() })

const initialItems = ["Bug", "Feature", "Enhancement", "Documentation"].map(toItem)

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [items, setItems] = createSignal(initialItems)
  const [query, setQuery] = createSignal("")

  const search = createMemo(() => query().trim())
  const filtered = createMemo(() => items().filter((item) => contains(item.label, search())))
  // The "Create" option is the new item itself, so selecting it needs no extra mapping
  const exists = createMemo(() => items().some((item) => item.label.toLowerCase() === search().toLowerCase()))
  const newItem = createMemo(() => (search() && !exists() ? toItem(search()) : null))
  const options = createMemo(() => {
    const item = newItem()
    return item ? [...filtered(), item] : filtered()
  })

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
    allowCustomValue: true,
    onOpenChange({ open, reason }) {
      // Show every item, unless it opened because the user typed
      if (open && reason !== "input-change") setQuery("")
    },
    onInputValueChange({ inputValue, reason }) {
      if (reason === "input-change") setQuery(inputValue)
    },
    onValueChange({ items: selected }) {
      const [item] = selected as Item[]
      if (item && !items().some((existing) => existing.value === item.value)) {
        setItems((prev) => [...prev, item])
      }
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <>
      <main class="combobox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Label</label>
          <div {...api().getControlProps()}>
            <input {...api().getInputProps()} placeholder="Search or create" />
            <button {...api().getTriggerProps()}>▼</button>
            <button {...api().getClearTriggerProps()}>
              <XIcon />
            </button>
          </div>
        </div>
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div {...api().getListProps()}>
              <For each={options()}>
                {(item) => (
                  <div {...api().getItemProps({ item })}>
                    <span {...api().getItemIndicatorProps({ item })}>✅</span>
                    <span>{item.value === newItem()?.value ? `Create "${item.label}"` : item.label}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
