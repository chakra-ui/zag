import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { listboxData, type ListboxOption } from "@zag-js/shared"
import { useId } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/listbox.css"

const collection = listbox.collection({ items: listboxData.notifications })

export default function Page() {
  const service = useMachine(listbox.machine as listbox.Machine<ListboxOption>, {
    collection,
    id: useId(),
    defaultValue: ["comments", "mentions"],
    selectionMode: "multiple",
  })

  const api = listbox.connect(service, normalizeProps)
  const allSelected = api.value.length === collection.size

  return (
    <>
      <main className="listbox">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Email notifications</label>
          <div {...api.getContentProps()}>
            <div className="listbox-header">
              <span data-testid="value-text">
                {api.value.length} of {collection.size} selected
              </span>
              <div>
                <button type="button" onClick={() => api.selectAll()} disabled={allSelected}>
                  Select all
                </button>
                <button type="button" onClick={() => api.clearValue()} disabled={api.value.length === 0}>
                  Clear
                </button>
              </div>
            </div>
            <ul {...api.getListProps()}>
              {listboxData.notifications.map((item) => (
                <li key={item.value} {...api.getItemProps({ item, highlightOnHover: true })}>
                  <div className="listbox-item-body">
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                    <span className="listbox-item-description">{item.description}</span>
                  </div>
                  <span {...api.getItemIndicatorProps({ item })}>✓</span>
                </li>
              ))}
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
