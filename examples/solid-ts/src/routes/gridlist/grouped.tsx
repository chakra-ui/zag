import * as gridlist from "@zag-js/gridlist"
import { gridListGroupedData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import "@styles/gridlist.css"

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
    id: createUniqueId(),
    collection,
    selectionMode: "single",
    selectionBehavior: "replace",
  })

  const api = createMemo(() => gridlist.connect(service, normalizeProps))

  return (
    <>
      <main>
        <div class="gridlist">
          <div {...api().getRootProps()}>
            <label {...api().getLabelProps()}>Bookmarks</label>
            <div {...api().getContentProps()}>
              <For each={api().collection.group()}>
                {([groupKey, items]) => (
                  <div {...api().getItemGroupProps({ id: groupKey })}>
                    <div {...api().getItemGroupLabelProps({ htmlFor: groupKey })}>{groupKey}</div>
                    <For each={items}>
                      {(item) => (
                        <div {...api().getItemProps({ item, focusOnHover: true })}>
                          <div {...api().getCellProps()}>
                            <div class="gridlist-item-body">
                              <span {...api().getItemTextProps({ item })} class="gridlist-item-title">
                                {item.name}
                              </span>
                              <span class="gridlist-item-description">{item.url}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                )}
              </For>
              <div {...api().getEmptyProps()}>No bookmarks</div>
            </div>
          </div>

          <p style={{ "margin-top": "12px", "font-size": "13px", color: "#52525b" }}>
            Selected: <strong>{api().valueAsString || "none"}</strong>
          </p>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["focusedValue", "value"]} />
      </Toolbar>
    </>
  )
}
