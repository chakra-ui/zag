import { useVirtualizer } from "@tanstack/react-virtual"
import { getComputedStyle } from "@zag-js/dom-query"
import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/react"
import { useId, useRef } from "react"

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
  const contentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => contentRef.current,
    estimateSize: () => 28,
    overscan: 12,
    get scrollPaddingStart() {
      if (!contentRef.current) return 0
      const style = getComputedStyle(contentRef.current)
      return (
        Number.parseFloat(style.paddingBlockStart || style.paddingTop) +
        Number.parseFloat(style.borderBlockStartWidth || style.borderTopWidth) +
        Number.parseFloat(style.outlineWidth)
      )
    },
    get scrollPaddingEnd() {
      if (!contentRef.current) return 0
      const style = getComputedStyle(contentRef.current)
      return (
        Number.parseFloat(style.paddingBlockEnd || style.paddingBottom) +
        Number.parseFloat(style.borderBlockEndWidth || style.borderBottomWidth) +
        Number.parseFloat(style.outlineWidth)
      )
    },
  })

  const service = useMachine(listbox.machine as listbox.Machine<Item>, {
    collection,
    id: useId(),
    scrollToIndexFn: (e) => {
      rowVirtualizer.scrollToIndex(e.index, { align: "auto" })
    },
  })

  const api = listbox.connect(service, normalizeProps)

  return (
    <>
      <main className="listbox">
        <div {...api.getRootProps()}>
          <label {...api.getLabelProps()}>Label</label>
          <div ref={contentRef} {...api.getContentProps()}>
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const item = items[virtualItem.index]
                return (
                  <div
                    key={item.value}
                    {...api.getItemProps({ item })}
                    data-index={virtualItem.index}
                    aria-setsize={items.length}
                    aria-posinset={virtualItem.index + 1}
                    style={{
                      position: "absolute",
                      top: 0,
                      insetBlockStart: 0,
                      transform: `translateY(${virtualItem.start}px)`,
                      overflowAnchor: "none",
                      width: "100%",
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
      </main>
    </>
  )
}
