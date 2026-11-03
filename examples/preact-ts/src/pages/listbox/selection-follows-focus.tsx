import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/preact"
import { listboxData, type ListboxOption } from "@zag-js/shared"
import { useId } from "preact/hooks"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"
import "@styles/listbox.css"

const collection = listbox.collection({ items: listboxData.calendarViews })

export default function Page() {
  const service = useMachine(listbox.machine as listbox.Machine<ListboxOption>, {
    collection,
    id: useId(),
    defaultValue: ["week"],
    orientation: "horizontal",
    selectionMode: "single",
    deselectable: false,
    // arrow keys select as they move
    selectOnHighlight: true,
  })

  const api = listbox.connect(service, normalizeProps)

  return (
    <>
      <main className="listbox listbox-segmented">
        <div className="listbox-stack">
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Calendar view</label>
            <div {...api.getContentProps()}>
              <ul {...api.getListProps()}>
                {listboxData.calendarViews.map((item) => (
                  <li key={item.value} {...api.getItemProps({ item })}>
                    <span {...api.getItemTextProps({ item })}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="listbox-preview" data-testid="preview">
            Showing the {api.valueAsString.toLowerCase()} view
          </div>
        </div>
      </main>

      <Toolbar viz>
        <StateVisualizer state={service} context={["value", "highlightedValue"]} />
      </Toolbar>
    </>
  )
}
