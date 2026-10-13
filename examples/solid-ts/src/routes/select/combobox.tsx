import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/i18n-utils"
import { selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/select.css"
import "@styles/combobox.css"

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [options, setOptions] = createSignal(selectData)

  const collection = createMemo(() => combobox.collection({ items: options() }))

  const id = createUniqueId()

  const service = useMachine(combobox.machine, (): combobox.Props => ({
    id,
    collection: collection(),
    popupType: "dialog",
    selectionBehavior: "clear",
    inputBehavior: "autohighlight",
    onOpenChange() {
      setOptions(selectData)
    },
    onInputValueChange({ inputValue }) {
      const filtered = selectData.filter((item) => contains(item.label, inputValue))
      setOptions(filtered.length > 0 ? filtered : selectData)
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <main class="select">
      <div {...api().getRootProps()}>
        <label {...api().getLabelProps()}>Country</label>
        <div {...api().getControlProps()}>
          <button {...api().getTriggerProps({ focusable: true })}>{api().valueAsString || "Select Country"}</button>
        </div>

        <Portal>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <input {...api().getInputProps()} />
              <div {...api().getListProps()}>
                <For each={options()}>{(item) => <div {...api().getItemProps({ item })}>{item.label}</div>}</For>
              </div>
            </div>
          </div>
        </Portal>
      </div>
    </main>
  )
}
