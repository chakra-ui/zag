import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
import "@styles/combobox.css"

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [options, setOptions] = createSignal(comboboxData)
  const [selected, setSelected] = createSignal("")

  const collection = createMemo(() =>
    combobox.collection({
      items: options(),
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const service = useMachine(combobox.machine, {
    id: createUniqueId(),
    get collection() {
      return collection()
    },
    inline: true,
    inputBehavior: "autohighlight",
    onInputValueChange({ inputValue }) {
      setOptions(comboboxData.filter((item) => contains(item.label, inputValue)))
    },
    onSelect({ itemValue }) {
      setSelected(collection().stringify(itemValue) ?? "")
    },
  })

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <main class="combobox">
      <output data-testid="selected">Selected: {selected()}</output>
      <div {...api().getRootProps()}>
        <div {...api().getControlProps()}>
          <input data-testid="input" {...api().getInputProps()} />
        </div>
        <ul {...api().getListProps()}>
          <For each={options()}>
            {(item) => (
              <li {...api().getItemProps({ item })}>
                <span>{item.label}</span>
              </li>
            )}
          </For>
        </ul>
      </div>
    </main>
  )
}
