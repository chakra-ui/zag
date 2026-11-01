import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { ChevronsUpDownIcon } from "lucide-solid"
import { createEffect, createMemo, createUniqueId, For } from "solid-js"
import { Portal } from "solid-js/web"
import "@styles/select.css"

interface Item {
  label: string
  value: string
}

export default function Page() {
  const collection = select.collection({ items: selectData })

  const service = useMachine(select.machine as select.Machine<Item>, {
    id: createUniqueId(),
    collection,
    multiple: true,
    closeOnSelect: false,
  })

  const api = createMemo(() => select.connect(service, normalizeProps))

  const allSelected = () => api().value.length === collection.size
  const someSelected = () => api().value.length > 0 && !allSelected()

  const toggleAll = () => {
    if (allSelected()) api().clearValue()
    else api().selectAll()
  }

  let checkboxRef: HTMLInputElement | undefined
  createEffect(() => {
    if (checkboxRef) checkboxRef.indeterminate = someSelected()
  })

  return (
    <main class="select">
      <div {...api().getRootProps()}>
        <div {...api().getControlProps()}>
          <label {...api().getLabelProps()}>Countries</label>
          <button {...api().getTriggerProps()}>
            <span>{api().hasSelectedItems ? `${api().value.length} selected` : "Select countries"}</span>
            <span {...api().getIndicatorProps()}>
              <ChevronsUpDownIcon />
            </span>
          </button>
        </div>

        <Portal>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <label data-select-select-all="">
                <input ref={checkboxRef} type="checkbox" checked={allSelected()} onChange={toggleAll} />
                <span>{allSelected() ? "Deselect all" : "Select all"}</span>
                <span data-select-select-all-count="">
                  {api().value.length} / {collection.size}
                </span>
              </label>

              <div {...api().getListProps()}>
                <For each={selectData}>
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
        </Portal>
      </div>
    </main>
  )
}
