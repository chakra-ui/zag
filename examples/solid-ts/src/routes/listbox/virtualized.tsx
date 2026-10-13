import * as listbox from "@zag-js/listbox"
import { normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, Index } from "solid-js"
import { useListVirtualizer } from "~/hooks/use-virtualizer"
import "@styles/listbox.css"

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
    id: createUniqueId(),
    scrollToIndexFn(details) {
      virtualizer.scrollToIndex(details.index, { align: "auto" })
    },
  })

  const api = createMemo(() => listbox.connect(service, normalizeProps))

  return (
    <>
      <main class="listbox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Label</label>
          <div {...api().getContentProps()}>
            <div ref={ref} {...api().getListProps()} onScroll={virtualizer.handleScroll}>
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                <Index each={virtualizer.getVirtualItems()}>
                  {(virtualItem) => {
                    const item = () => items[virtualItem().index]
                    return (
                      <div
                        {...api().getItemProps({ item: item() })}
                        data-index={virtualItem().index}
                        aria-setsize={items.length}
                        aria-posinset={virtualItem().index + 1}
                        style={{
                          ...virtualizer.getItemStyle(virtualItem()),
                          "overflow-anchor": "none",
                        }}
                      >
                        <span {...api().getItemTextProps({ item: item() })}>{item().label}</span>
                        <span {...api().getItemIndicatorProps({ item: item() })}>✓</span>
                      </div>
                    )
                  }}
                </Index>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
