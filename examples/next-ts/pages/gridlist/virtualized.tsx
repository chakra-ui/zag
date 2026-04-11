import { useVirtualizer } from "@tanstack/react-virtual"
import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CheckIcon } from "lucide-react"
import { useId, useMemo, useRef } from "react"
import { StateVisualizer } from "../../components/state-visualizer"
import { Toolbar } from "../../components/toolbar"

interface Row {
  id: string
  index: number
  name: string
}

const ROW_HEIGHT = 44
const ROW_COUNT = 10000

const items: Row[] = Array.from({ length: ROW_COUNT }, (_, i) => ({
  id: `row-${i}`,
  index: i,
  name: `Row ${i + 1}`,
}))

export default function Page() {
  const rootRef = useRef<HTMLDivElement>(null)

  const collection = useMemo(
    () =>
      gridlist.collection<Row>({
        items,
        itemToValue: (item) => item.id,
        itemToString: (item) => item.name,
      }),
    [],
  )

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => rootRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  })

  const service = useMachine(gridlist.machine as gridlist.Machine<Row>, {
    id: useId(),
    collection,
    selectionMode: "multiple",
    scrollToIndexFn(details) {
      rowVirtualizer.scrollToIndex(details.index, { align: "auto" })
    },
  })

  const api = gridlist.connect(service, normalizeProps)
  const virtualItems = rowVirtualizer.getVirtualItems()

  return (
    <>
      <main>
        <div className="gridlist">
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>10,000 rows</label>
            <div ref={rootRef} {...api.getContentProps()} style={{ height: 360, width: 480 }}>
              <div
                style={{
                  height: rowVirtualizer.getTotalSize(),
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualItems.map((virtualItem) => {
                  const item = items[virtualItem.index]
                  return (
                    <div
                      key={item.id}
                      {...api.getItemProps({ item })}
                      data-index={virtualItem.index}
                      aria-setsize={items.length}
                      aria-posinset={virtualItem.index + 1}
                      style={{
                        position: "absolute",
                        insetBlockStart: 0,
                        insetInlineStart: 0,
                        width: "100%",
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                        overflowAnchor: "none",
                      }}
                    >
                      <div {...api.getCellProps()}>
                        {api.showCheckboxes && (
                          <button {...api.getItemCheckboxProps({ item })}>
                            <CheckIcon {...api.getItemIndicatorProps({ item })} />
                          </button>
                        )}
                        <div className="gridlist-item-body">
                          <span {...api.getItemTextProps({ item })} className="gridlist-item-title">
                            {item.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <p style={{ marginTop: "12px", fontSize: "13px", color: "#52525b" }}>
            Selected: <strong>{api.value.length}</strong> · Rendered: {virtualItems.length} of {items.length}
          </p>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} context={["focusedValue", "value"]} />
      </Toolbar>
    </>
  )
}
