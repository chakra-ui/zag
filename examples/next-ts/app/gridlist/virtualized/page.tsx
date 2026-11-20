"use client"

import * as gridlist from "@zag-js/gridlist"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import { CheckIcon } from "lucide-react"
import { useId, useMemo } from "react"
import { useListVirtualizer } from "@/hooks/use-virtualizer"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import "@styles/gridlist.css"

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
    itemSize: ROW_HEIGHT,
    overscan: 8,
    // Grid rows take `aria-rowindex`, not list positions
    aria: false,
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
              {...mergeProps(virtualizer.getRootProps(), api.getContentProps(), { style: { height: 360, width: 480 } })}
            >
              <div {...virtualizer.getContentProps()}>
                {virtualItems.map((vi) => {
                  const item = items[vi.index]
                  return (
                    <div key={item.id} {...mergeProps(virtualizer.getItemProps(vi), api.getItemProps({ item }))}>
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
