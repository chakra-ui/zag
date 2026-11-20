import * as listbox from "@zag-js/listbox"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { createMemo, createUniqueId, For } from "solid-js"
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
    itemSize: 32,
    overscan: 12,
  })

  const service = useMachine(listbox.machine as listbox.Machine<Item>, {
    collection,
    id: createUniqueId(),
    scrollToIndexFn(details) {
      virtualizer().scrollToIndex(details.index, { align: "auto" })
    },
  })

  const api = createMemo(() => listbox.connect(service, normalizeProps))

  return (
    <>
      <main class="listbox">
        <div {...api().getRootProps()}>
          <label {...api().getLabelProps()}>Label</label>
          <div {...api().getContentProps()}>
            <div
              ref={ref}
              {...mergeProps(
                () => virtualizer().getRootProps(),
                () => api().getListProps(),
              )}
            >
              <div {...virtualizer().getContentProps()}>
                <For keyed={false} each={virtualizer().getVirtualItems()}>
                  {(virtualItem) => {
                    const item = () => items[virtualItem().index]
                    return (
                      <div
                        {...mergeProps(
                          () => virtualizer().getItemProps(virtualItem()),
                          () => api().getItemProps({ item: item() }),
                        )}
                      >
                        <span {...api().getItemTextProps({ item: item() })}>{item().label}</span>
                        <span {...api().getItemIndicatorProps({ item: item() })}>✓</span>
                      </div>
                    )
                  }}
                </For>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
