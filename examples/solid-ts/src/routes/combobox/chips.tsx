import * as combobox from "@zag-js/combobox"
import { createFilter } from "@zag-js/utils/search"
import { comboboxData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { XIcon } from "lucide-solid"
import { For, createMemo, createSignal, createUniqueId } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/combobox.css"

interface Item {
  code: string
  label: string
}

const { contains } = createFilter({ sensitivity: "base" })

export default function Page() {
  const [query, setQuery] = createSignal("")

  const collection = createMemo(() =>
    combobox.collection({
      items: comboboxData.filter((item) => contains(item.label, query())),
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = createUniqueId()

  const service = useMachine(combobox.machine as combobox.Machine<Item>, (): combobox.Props<Item> => ({
    id,
    collection: collection(),
    multiple: true,
    defaultValue: ["US", "CA"],
    onInputValueChange({ inputValue }) {
      setQuery(inputValue)
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))

  return (
    <>
      <main class="combobox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Countries</label>
          <div {...api().getControlProps()}>
            <div {...api().getChipGroupProps()}>
              <For each={api().selectedItems}>
                {(item) => (
                  <span {...api().getChipProps({ item })}>
                    {item.label}
                    <button {...api().getChipDeleteTriggerProps({ item })}>
                      <XIcon />
                    </button>
                  </span>
                )}
              </For>
              <input {...api().getInputProps()} placeholder={api().value.length ? "" : "Add countries"} />
            </div>
          </div>
        </div>

        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div {...api().getListProps()}>
              <For each={collection().items}>
                {(item) => (
                  <div {...api().getItemProps({ item })}>
                    <span {...api().getItemTextProps({ item })}>{item.label}</span>
                    <span {...api().getItemIndicatorProps({ item })}>✓</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["value", "inputValue", "highlightedValue"]} />
      </Toolbar>
    </>
  )
}
