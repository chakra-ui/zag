import * as gridlist from "@zag-js/gridlist"
import { gridListGridData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/gridlist.css"

interface Fruit {
  id: string
  name: string
  icon: string
}

const COLUMN_COUNT = 4

export default function Page() {
  const collection = gridlist.gridCollection<Fruit>({
    items: gridListGridData,
    columnCount: COLUMN_COUNT,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
  })

  const service = useMachine(gridlist.machine as gridlist.Machine<Fruit>, {
    id: createUniqueId(),
    collection,
    selectionMode: "multiple",
    selectionBehavior: "replace",
  })

  const api = createMemo(() => gridlist.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="gridlist">
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Pick some fruit</label>
            <div {...api().getContentProps()}>
              <For each={gridListGridData}>
                {(item) => (
                  <div {...api().getItemProps({ item, focusOnHover: true })}>
                    <div {...api().getCellProps()}>
                      <span class="gridlist-tile-icon">{item.icon}</span>
                      <span {...api().getItemTextProps({ item })} class="gridlist-tile-label">
                        {item.name}
                      </span>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          <p style={{ "margin-top": "12px", "font-size": "13px", color: "#52525b" }}>
            Selected: <strong>{api().valueAsString || "none"}</strong>
          </p>
          <p style={{ "font-size": "12px", color: "#71717a" }}>
            Arrow keys navigate between cells; hold Shift to extend; Cmd/Ctrl-click to toggle.
          </p>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["focusedValue", "value"]} />
      </Toolbar>
    </>
  )
}
