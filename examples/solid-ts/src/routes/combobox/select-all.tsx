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
  const items = createMemo(() => comboboxData.filter((item) => contains(item.label, query())))

  const collection = createMemo(() =>
    combobox.collection({
      items: items(),
      itemToValue: (item) => item.code,
      itemToString: (item) => item.label,
    }),
  )

  const id = createUniqueId()

  const service = useMachine(combobox.machine as combobox.Machine<Item>, (): combobox.Props<Item> => ({
    id,
    collection: collection(),
    multiple: true,
    onOpenChange({ open }) {
      if (open) setQuery("")
    },
    onInputValueChange({ inputValue, reason }) {
      if (reason === "input-change") setQuery(inputValue)
    },
  }))

  const api = createMemo(() => combobox.connect(service, normalizeProps))
  const selectAll = createMemo(() => api().getSelectAllState())

  return (
    <>
      <main class="combobox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Countries</label>
          <div {...api().getControlProps()}>
            <input {...api().getInputProps()} placeholder={`${api().value.length} selected`} />
            <button {...api().getTriggerProps()}>▼</button>
            <button {...api().getClearTriggerProps()}>
              <XIcon />
            </button>
          </div>
        </div>
        <pre data-testid="value">value: {api().value.join(", ") || "—"}</pre>
        <div {...api().getPositionerProps()}>
          <div {...api().getContentProps()}>
            <div {...api().getListProps()}>
              {/* Selects every item that matches the text, or unselects them all */}
              <div {...api().getSelectAllProps()}>
                <span class="combobox-check">{selectAll().checked ? "✓" : selectAll().indeterminate ? "–" : ""}</span>
                <span>{selectAll().checked ? "Unselect all" : "Select all"}</span>
              </div>
              <hr {...api().getSeparatorProps()} />
              <For each={items()}>
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
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
