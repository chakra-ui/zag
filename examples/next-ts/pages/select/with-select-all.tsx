import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { useId } from "react"

interface Item {
  label: string
  value: string
}

export default function Page() {
  const collection = select.collection({ items: selectData })

  const service = useMachine(select.machine as select.Machine<Item>, {
    id: useId(),
    collection,
    multiple: true,
    closeOnSelect: false,
  })

  const api = select.connect(service, normalizeProps)

  const allSelected = api.value.length === collection.size
  const someSelected = api.value.length > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) api.clearValue()
    else api.selectAll()
  }

  return (
    <main className="select">
      <div {...api.getRootProps()}>
        <div {...api.getControlProps()}>
          <label {...api.getLabelProps()}>Countries</label>
          <button {...api.getTriggerProps()}>
            <span>{api.hasSelectedItems ? `${api.value.length} selected` : "Select countries"}</span>
            <span {...api.getIndicatorProps()}>▼</span>
          </button>
        </div>

        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <label data-select-select-all="">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected
                  }}
                />
                <span>{allSelected ? "Deselect all" : "Select all"}</span>
                <span data-select-select-all-count="">
                  {api.value.length} / {collection.size}
                </span>
              </label>

              <div {...api.getListProps()}>
                {selectData.map((item) => (
                  <div key={item.value} {...api.getItemProps({ item })}>
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                    <span {...api.getItemIndicatorProps({ item })}>✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Portal>
      </div>
    </main>
  )
}
