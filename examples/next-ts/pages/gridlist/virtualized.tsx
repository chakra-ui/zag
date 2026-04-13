import * as gridlist from "@zag-js/gridlist"
import { normalizeProps, useMachine } from "@zag-js/react"
import { CheckIcon } from "lucide-react"
import { useId, useMemo } from "react"
import { useListVirtualizer } from "../../hooks/use-virtualizer"
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
  const collection = useMemo(
    () =>
      gridlist.collection<Row>({
        items,
        itemToValue: (item) => item.id,
        itemToString: (item) => item.name,
      }),
    [],
  )

  const { virtualizer, ref } = useListVirtualizer({
    count: items.length,
    estimatedSize: () => ROW_HEIGHT,
    overscan: 8,
  })

  const service = useMachine(gridlist.machine as gridlist.Machine<Row>, {
    id: useId(),
    collection,
    selectionMode: "multiple",
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "auto" })
    },
  })

  const api = gridlist.connect(service, normalizeProps)
  const virtualItems = virtualizer.getVirtualItems()

  return (
    <>
      <main>
        <div className="gridlist">
          <div {...api.getRootProps()}>
            <label {...api.getLabelProps()}>10,000 rows</label>
            <div
              ref={ref}
              {...api.getContentProps()}
              onScroll={virtualizer.handleScroll}
              style={{ height: 360, width: 480 }}
            >
              <div style={{ height: virtualizer.getTotalSize(), width: "100%", position: "relative" }}>
                {virtualItems.map((vi) => {
                  const item = items[vi.index]
                  return (
                    <div
                      key={item.id}
                      {...api.getItemProps({ item })}
                      data-index={vi.index}
                      aria-setsize={items.length}
                      aria-posinset={vi.index + 1}
                      style={{ ...virtualizer.getItemStyle(vi), overflowAnchor: "none" }}
                    >
                      <div {...api.getCellProps()}>
                        {api.hasCheckbox && (
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
