import { createFilter } from "@zag-js/i18n-utils"
import * as listbox from "@zag-js/listbox"
import { listboxControls, selectData } from "@zag-js/shared"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useControls } from "~/hooks/use-controls"
import "@styles/listbox.css"

interface Item {
  label: string
  value: string
}

const filter = createFilter({ sensitivity: "base" })

export default function Page() {
  const [search, setSearch] = createSignal("")

  const collection = createMemo(() => {
    const items = selectData.filter((item) => filter.startsWith(item.label, search()))
    return listbox.collection({ items })
  })

  const controls = useControls(listboxControls)
  const id = createUniqueId()

  const service = useMachine(
    listbox.machine as listbox.Machine<Item>,
    controls.mergeProps<listbox.Props<Item>>(() => ({
      collection: collection(),
      id,
      typeahead: false,
    })),
  )

  const api = createMemo(() => listbox.connect(service, normalizeProps))

  return (
    <>
      <main class="listbox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Country</label>
          <div {...api().getContentProps()}>
            <input
              {...mergeProps(api().getInputProps({ autoHighlight: true }), {
                onInput: (e: InputEvent & { currentTarget: HTMLInputElement }) => setSearch(e.currentTarget.value),
              })}
              aria-label="Filter countries"
              placeholder="Filter…"
              value={search()}
            />
            <div {...api().getEmptyProps()}>{collection().size === 0 && `No matches for "${search()}"`}</div>
            <ul {...api().getListProps()}>
              <For each={collection().items}>
                {(item) => (
                  <li {...api().getItemProps({ item })}>
                    <span {...api().getItemTextProps({ item })}>{item.label}</span>
                    <span {...api().getItemIndicatorProps({ item })}>✓</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
      </main>

      <Toolbar controls={controls} viz>
        <StateVisualizer state={service} context={["highlightedValue", "focused"]} />
      </Toolbar>
    </>
  )
}
