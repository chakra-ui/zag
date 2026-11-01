import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/combobox.css"

const links = [
  { label: "Basic", href: "/combobox/basic" },
  { label: "Async", href: "/combobox/async" },
  { label: "Multiple", href: "/combobox/multiple" },
]

export default function Page() {
  const [items, setItems] = createSignal(links)
  const [selection, setSelection] = createSignal<combobox.SelectionDetails | null>(null)

  const collection = createMemo(() =>
    combobox.collection({
      items: items(),
      itemToValue: (item) => item.href,
      itemToString: (item) => item.label,
    }),
  )

  const id = createUniqueId()
  const service = useMachine(combobox.machine, () => ({
    id,
    collection: collection(),
    onSelect: setSelection,
    onInputValueChange({ inputValue }) {
      setItems(links.filter((item) => item.label.toLowerCase().includes(inputValue.toLowerCase())))
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <main class="combobox">
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Go to page</label>
        <div {...api().getControlProps()}>
          <input data-testid="input" {...api().getInputProps()} />
        </div>
      </div>
      <div {...api().getPositionerProps()}>
        <div data-testid="combobox-content" {...api().getContentProps()}>
          <For each={items()}>
            {(item) => (
              <a href={item.href} {...api().getItemProps({ item })}>
                {item.label}
              </a>
            )}
          </For>
        </div>
      </div>
      <pre data-testid="selection">{JSON.stringify(selection())}</pre>
    </main>
  )
}
