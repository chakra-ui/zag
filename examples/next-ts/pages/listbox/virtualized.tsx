import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId } from "react"
import { useListVirtualizer } from "../../hooks/use-virtualizer"

const items = new Array(10000).fill(0).map((_, index) => ({
  label: `Item ${index}`,
  value: `item-${index}`,
}))

const collection = listbox.collection({ items })

interface Item {
  label: string
  value: string
}

export default function Page() {
  const { virtualizer, ref } = useListVirtualizer({
    count: items.length,
    estimatedSize: () => 28,
    overscan: 12,
  })

  const service = useMachine(listbox.machine as listbox.Machine<Item>, {
    collection,
    id: useId(),
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "auto" })
    },
  })

  const api = listbox.connect(service, normalizeProps)
  const virtualItems = virtualizer.getVirtualItems()

  return (
    <>
      <main className="listbox">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Label</label>
          <div {...api.getContentProps()}>
            <div ref={ref} {...api.getListProps()} onScroll={virtualizer.handleScroll}>
              <div
                style={{
                  height: virtualizer.getTotalSize(),
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualItems.map((virtualItem) => {
                  const item = items[virtualItem.index]
                  return (
                    <div
                      key={item.value}
                      {...api.getItemProps({ item })}
                      data-index={virtualItem.index}
                      aria-setsize={items.length}
                      aria-posinset={virtualItem.index + 1}
                      style={{
                        ...virtualizer.getItemStyle(virtualItem),
                        overflowAnchor: "none",
                      }}
                    >
                      <span {...api.getItemTextProps({ item })}>{item.label}</span>
                      <span {...api.getItemIndicatorProps({ item })}>✓</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
