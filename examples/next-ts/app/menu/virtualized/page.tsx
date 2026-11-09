"use client"

import * as menu from "@zag-js/menu"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { useId, useState } from "react"
import { useListVirtualizer } from "@/hooks/use-virtualizer"
import "@styles/menu.css"

const items = Array.from({ length: 1000 }, (_, index) => ({ value: `item-${index}`, label: `Item ${index}` }))

const collection = menu.collection({ items })

const estimateSize = () => 32

export default function Page() {
  const [selected, setSelected] = useState("-")

  const { virtualizer, ref } = useListVirtualizer({
    count: items.length,
    estimatedSize: estimateSize,
    observeScrollElementSize: true,
  })

  const service = useMachine(menu.machine, {
    id: useId(),
    collection,
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index)
    },
    onSelect: ({ value }) => setSelected(value),
  })

  const api = menu.connect(service, normalizeProps)

  return (
    <main>
      <button {...api.getTriggerProps()}>
        Pick an item <span {...api.getIndicatorProps()}>▾</span>
      </button>
      <p>
        Selected: <output aria-label="Selected item">{selected}</output>
      </p>
      {api.open && (
        <Portal>
          <div {...api.getPositionerProps()}>
            <div
              {...api.getContentProps()}
              ref={ref}
              onScroll={virtualizer.handleScroll}
              style={{ maxHeight: 320, overflowY: "auto" }}
            >
              <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const item = items[virtualItem.index]
                  return (
                    <div
                      key={item.value}
                      {...api.getItemProps({ value: item.value })}
                      style={virtualizer.getItemStyle(virtualItem)}
                    >
                      {item.label}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </main>
  )
}
