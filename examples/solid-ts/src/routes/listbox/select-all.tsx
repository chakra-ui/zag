import * as listbox from "@zag-js/listbox"
import { listboxData, type ListboxOption } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/listbox.css"

const collection = listbox.collection({ items: listboxData.notifications })

export default function Page() {
  const service = useMachine(listbox.machine as listbox.Machine<ListboxOption>, {
    collection,
    id: createUniqueId(),
    defaultValue: ["comments", "mentions"],
    selectionMode: "multiple",
  })

  const api = createMemo(() => listbox.connect(service, normalizeProps))
  const allSelected = () => api().value.length === collection.size
  const selectAll = createMemo(() => api().getSelectAllState())

  return (
    <>
      <main class="listbox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Email notifications</label>
          <div {...api().getContentProps()}>
            <div class="listbox-header">
              <span data-testid="value-text">
                {api().value.length} of {collection.size} selected
              </span>
              <div>
                <button type="button" onClick={() => api().selectAll()} disabled={allSelected()}>
                  Select all
                </button>
                <button type="button" onClick={() => api().clearValue()} disabled={api().value.length === 0}>
                  Clear
                </button>
              </div>
            </div>
            <ul {...api().getListProps()}>
              {/* An option, so the keyboard reaches it before the items */}
              <li {...api().getSelectAllProps()}>
                <span class="listbox-item-body">{selectAll().checked ? "Unselect all" : "Select all"}</span>
                <span class="listbox-check" aria-hidden="true">
                  {selectAll().checked ? "✓" : selectAll().indeterminate ? "–" : ""}
                </span>
              </li>
              <For each={listboxData.notifications}>
                {(item) => (
                  <li {...api().getItemProps({ item, highlightOnHover: true })}>
                    <div class="listbox-item-body">
                      <span {...api().getItemTextProps({ item })}>{item.label}</span>
                      <span class="listbox-item-description">{item.description}</span>
                    </div>
                    <span {...api().getItemIndicatorProps({ item })}>✓</span>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["value", "highlightedValue"]} />
      </Toolbar>
    </>
  )
}
