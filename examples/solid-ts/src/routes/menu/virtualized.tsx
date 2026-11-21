import * as menu from "@zag-js/menu"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import { Portal } from "@solidjs/web"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { useListVirtualizer } from "~/hooks/use-virtualizer"
import "@styles/menu.css"

const items = Array.from({ length: 1000 }, (_, index) => ({
  value: `item-${index}`,
  label: `Item ${index}`,
}))

const collection = menu.collection({ items })

export default function Page() {
  const [selected, setSelected] = createSignal("-")

  const { virtualizer, ref } = useListVirtualizer({
    count: items.length,
    itemSize: 32,
    observeScrollElementSize: true,
  })

  const service = useMachine(menu.machine, {
    id: createUniqueId(),
    collection,
    scrollToIndexFn(details) {
      virtualizer().scrollToIndex(details.index)
    },
    onSelect: ({ value }) => setSelected(value),
  })

  const api = createMemo(() => menu.connect(service, normalizeProps))

  return (
    <main>
      <button {...api().getTriggerProps()}>
        Pick an item <span {...api().getIndicatorProps()}>▾</span>
      </button>
      <p>
        Selected: <output aria-label="Selected item">{selected()}</output>
      </p>
      <Show when={api().open}>
        <Portal>
          <div {...api().getPositionerProps()}>
            <div {...api().getContentProps()}>
              <div
                {...mergeProps(
                  () => virtualizer().getRootProps(),
                  () => api().getListProps(),
                  { style: { "max-height": "320px" } },
                )}
                ref={ref}
              >
                <div {...virtualizer().getContentProps()}>
                  <For keyed={false} each={virtualizer().getVirtualItems()}>
                    {(virtualItem) => {
                      const item = () => items[virtualItem().index]
                      return (
                        <div
                          {...mergeProps(
                            () => virtualizer().getItemProps(virtualItem()),
                            () => api().getItemProps({ value: item().value }),
                          )}
                        >
                          {item().label}
                        </div>
                      )
                    }}
                  </For>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </main>
  )
}
