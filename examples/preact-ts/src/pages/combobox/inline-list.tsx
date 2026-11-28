import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { comboboxData } from "@zag-js/shared"
import { useId, useState } from "preact/hooks"
import "@styles/combobox.css"

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [options, setOptions] = useState(comboboxData)
  const [selected, setSelected] = useState("")

  const collection = combobox.collection({
    items: options,
    itemToValue: (item) => item.code,
    itemToString: (item) => item.label,
  })

  const service = useMachine(combobox.machine, {
    id: useId(),
    collection,
    inline: true,
    inputBehavior: "autohighlight",
    onInputValueChange({ inputValue }) {
      setOptions(comboboxData.filter((item) => contains(item.label, inputValue)))
    },
    onSelect({ itemValue }) {
      setSelected(collection.stringify(itemValue) ?? "")
    },
  })

  const api = combobox.connect(service, normalizeProps)

  return (
    <main className="combobox">
      <output data-testid="selected">Selected: {selected}</output>
      <div {...api.getRootProps()}>
        <div {...api.getControlProps()}>
          <input data-testid="input" {...api.getInputProps()} />
        </div>
        <ul {...api.getListProps()}>
          {options.map((item) => (
            <li key={item.code} {...api.getItemProps({ item })}>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
