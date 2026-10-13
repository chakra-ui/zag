import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-solid"
import { createComputed, createMemo, createSignal, createUniqueId, Index, Show, untrack } from "solid-js"
import { useListVirtualizer } from "~/hooks/use-virtualizer"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import styles from "@styles/dnd-list.module.css"

const initialItems = Array.from({ length: 500 }, (_, i) => ({
  id: String(i + 1),
  label: `Item ${i + 1}`,
}))

export default function Page() {
  const [items, setItems] = createSignal(initialItems)

  const { virtualizer, ref } = useListVirtualizer({
    count: initialItems.length,
    estimatedSize: () => 40,
    overscan: 10,
  })

  // Sync count before render
  createComputed(() => {
    const count = items().length
    untrack(() => virtualizer.updateOptions({ count }))
  })

  const service = useMachine(dnd.machine, {
    id: createUniqueId(),
    orientation: "vertical",
    scrollThreshold: 30,
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (i) => i.id }))
    },
  })

  const api = createMemo(() => dnd.connect(service, normalizeProps))

  return (
    <>
      <main class={styles.main}>
        <div {...api().getRootProps()} class={styles.root}>
          <h3>Virtualized (500 items)</h3>
          <div ref={ref} onScroll={virtualizer.handleScroll} class={styles.virtualViewport}>
            <div class={styles.virtualSizer} style={{ height: `${virtualizer.getTotalSize()}px` }}>
              <Index each={virtualizer.getVirtualItems()}>
                {(vi) => {
                  const item = () => items()[vi().index]
                  return (
                    <Show when={item()}>
                      {(item) => (
                        <div style={virtualizer.getItemStyle(vi())}>
                          <div class={styles.virtualRowInner}>
                            <div
                              {...api().getDropIndicatorProps({ value: item().id, placement: "before" })}
                              class={styles.dropIndicator}
                            />
                            <div
                              {...mergeProps(
                                api().getDraggableProps({ value: item().id }),
                                api().getDropTargetProps({ value: item().id }),
                                { class: `${styles.draggable} ${styles.dropTarget}` },
                              )}
                            >
                              <span {...api().getDragHandleProps({ value: item().id })} class={styles.dragHandle}>
                                <GripVertical size={14} />
                              </span>
                              {item().label}
                            </div>
                            <div
                              {...api().getDropIndicatorProps({ value: item().id, placement: "after" })}
                              class={styles.dropIndicator}
                            />
                          </div>
                        </div>
                      )}
                    </Show>
                  )
                }}
              </Index>
            </div>
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
