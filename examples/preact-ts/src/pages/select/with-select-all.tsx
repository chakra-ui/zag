import { Portal, normalizeProps, useMachine } from "@zag-js/preact"
import * as select from "@zag-js/select"
import { selectData } from "@zag-js/shared"
import { ChevronsUpDownIcon } from "lucide-preact"
import { useId } from "preact/hooks"
import "@styles/select.css"

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

  const selectAll = api.getSelectAllState()

  return (
    <main className="select">
      <div {...api.getRootProps()}>
        <div {...api.getControlProps()}>
          <label {...api.getLabelProps()}>Countries</label>
          <button {...api.getTriggerProps()}>
            <span>{api.hasSelectedItems ? `${api.value.length} selected` : "Select countries"}</span>
            <span {...api.getIndicatorProps()}>
              <ChevronsUpDownIcon />
            </span>
          </button>
        </div>

        <Portal>
          <div {...api.getPositionerProps()}>
            <div {...api.getContentProps()}>
              <div {...api.getListProps()}>
                {/* Stays in view: only the items below it scroll */}
                <div {...api.getSelectAllProps()}>
                  <span className="select-check" aria-hidden>
                    {selectAll.checked ? "✓" : selectAll.indeterminate ? "–" : ""}
                  </span>
                  <span>{selectAll.checked ? "Deselect all" : "Select all"}</span>
                  <span data-select-select-all-count="">
                    {api.value.length} / {collection.size}
                  </span>
                </div>
                <div className="select-items">
                  {selectData.map((item) => (
                    <div key={item.value} {...api.getItemProps({ item })}>
                      <span {...api.getItemTextProps({ item })}>{item.label}</span>
                      <span {...api.getItemIndicatorProps({ item })}>✓</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Portal>
      </div>
    </main>
  )
}
