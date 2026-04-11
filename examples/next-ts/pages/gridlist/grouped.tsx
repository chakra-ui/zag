import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/react"
import { gridListGroupedData } from "@zag-js/shared"
import { useId } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

interface Bookmark {
  id: string
  name: string
  url: string
  category: string
}

export default function Page() {
  const collection = gridlist.collection<Bookmark>({
    items: gridListGroupedData,
    itemToValue: (item) => item.id,
    itemToString: (item) => item.name,
    groupBy: (item) => item.category,
  })

  const service = useMachine(gridlist.machine as gridlist.Machine<Bookmark>, {
    id: useId(),
    collection,
    selectionMode: "single",
    selectionBehavior: "replace",
  })

  const api = gridlist.connect(service, normalizeProps)

  return (
    <>
      <main>
        <div className="gridlist">
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>Bookmarks</label>
            <div {...api.getContentProps()}>
              {api.collection.group().map(([groupKey, items]) => (
                <div key={groupKey} {...api.getItemGroupProps({ id: groupKey })}>
                  <div {...api.getItemGroupLabelProps({ htmlFor: groupKey })}>{groupKey}</div>
                  {items.map((item) => (
                    <div key={item.id} {...api.getItemProps({ item, focusOnHover: true })}>
                      <div {...api.getCellProps()}>
                        <div className="gridlist-item-body">
                          <span {...api.getItemTextProps({ item })} className="gridlist-item-title">
                            {item.name}
                          </span>
                          <span className="gridlist-item-description">{item.url}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div {...api.getEmptyProps()}>No bookmarks</div>
            </div>
          </div>

          <p style={{ marginTop: "12px", fontSize: "13px", color: "#52525b" }}>
            Selected: <strong>{api.valueAsString || "none"}</strong>
          </p>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["focusedValue", "value"]} />
      </Toolbar>
    </>
  )
}
