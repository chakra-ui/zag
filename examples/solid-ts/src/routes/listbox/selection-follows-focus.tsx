import * as listbox from "@zag-js/listbox"
import { listboxData, type ListboxOption } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/listbox.css"

const collection = listbox.collection({ items: listboxData.calendarViews })

export default function Page() {
  const service = useMachine(listbox.machine as listbox.Machine<ListboxOption>, {
    collection,
    id: createUniqueId(),
    defaultValue: ["week"],
    orientation: "horizontal",
    selectionMode: "single",
    deselectable: false,
    // arrow keys select as they move
    selectOnHighlight: true,
  })

  const api = createMemo(() => listbox.connect(service, normalizeProps))

  return (
    <>
      <main class="listbox listbox-segmented">
        <div class="listbox-stack">
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Calendar view</label>
            <div {...api().getContentProps()}>
              <ul {...api().getListProps()}>
                <For each={listboxData.calendarViews}>
                  {(item) => (
                    <li {...api().getItemProps({ item })}>
                      <span {...api().getItemTextProps({ item })}>{item.label}</span>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </div>
          <div class="listbox-preview" data-testid="preview">
            Showing the {api().valueAsString.toLowerCase()} view
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["value", "highlightedValue"]} />
      </Toolbar>
    </>
  )
}
