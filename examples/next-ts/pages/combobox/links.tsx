import * as combobox from "@zag-js/combobox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useState } from "react"

const links = [
  { label: "Basic", href: "/combobox/basic" },
  { label: "Async", href: "/combobox/async" },
  { label: "Multiple", href: "/combobox/multiple" },
]

export default function Page() {
  const [items, setItems] = useState(links)
  const [selection, setSelection] = useState<combobox.SelectionDetails | null>(null)

  const collection = combobox.collection({
    items,
    itemToValue: (item) => item.href,
    itemToString: (item) => item.label,
  })

  const service = useMachine(combobox.machine, {
    id: useId(),
    collection,
    onSelect: setSelection,
    onInputValueChange({ inputValue }) {
      setItems(links.filter((item) => item.label.toLowerCase().includes(inputValue.toLowerCase())))
    },
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <main className="combobox">
      <div {...api.getRootProps()}>
        <label {...api.getLabelProps()}>Go to page</label>
        <div {...api.getControlProps()}>
          <input data-testid="input" {...api.getInputProps()} />
        </div>
      </div>
      <div {...api.getPositionerProps()}>
        <div data-testid="combobox-content" {...api.getContentProps()}>
          {items.map((item) => (
            <a key={item.href} href={item.href} {...api.getItemProps({ item })}>
              {item.label}
            </a>
          ))}
        </div>
      </div>
      <pre data-testid="selection">{JSON.stringify(selection)}</pre>
    </main>
  )
}
