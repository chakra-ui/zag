import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/react"
import { gridListGridData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

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
    id: useId(),
    collection,
    selectionMode: "multiple",
    selectionBehavior: "replace",
  })

  const api = gridlist.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="gridlist">
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Pick some fruit</label>
            <div {...api.getContentProps()}>
              {gridListGridData.map((item) => (
                <div key={item.id} {...api.getItemProps({ item, focusOnHover: true })}>
                  <div {...api.getCellProps()}>
                    <span className="gridlist-tile-icon">{item.icon}</span>
                    <span {...api.getItemTextProps({ item })} className="gridlist-tile-label">
                      {item.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p style={{ marginTop: "12px", fontSize: "13px", color: "#52525b" }}>
            Selected: <strong>{api.valueAsString || "none"}</strong>
          </p>
          <p style={{ fontSize: "12px", color: "#71717a" }}>
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
