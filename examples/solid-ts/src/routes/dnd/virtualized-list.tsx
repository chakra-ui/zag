import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import styles from "@styles/dnd-virtualized-list.module.css"
import { GripVertical } from "lucide-solid"
import { createComputed, createMemo, createSignal, createUniqueId, Index, Show, untrack } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import { useListVirtualizer } from "~/hooks/use-virtualizer"

const initialItems = Array.from({ length: 500 }, (_, index) => ({
  id: String(index + 1),
  label: `Item ${index + 1}`,
}))

export default function Page() {
  const [items, setItems] = createSignal(initialItems)
  const [lastDrop, setLastDrop] = createSignal<string | null>(null)
  const [scrollTop, setScrollTop] = createSignal(0)

  const { virtualizer, ref } = useListVirtualizer({
    count: initialItems.length,
    estimatedSize: () => 44,
    overscan: 8,
  })

  createComputed(() => {
    const count = items().length
    untrack(() => virtualizer.updateOptions({ count }))
  })

  const service = useMachine(dnd.machine, {
    id: createUniqueId(),
    orientation: "vertical",
    scrollThreshold: 36,
    onDrop(details) {
      setLastDrop(`${details.source} -> ${details.target} ${details.placement}`)
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (item) => item.id }))
    },
  })

  const api = createMemo(() => dnd.connect(service, normalizeProps))
  const range = () => virtualizer.getRange()
  const draggedItem = createMemo(() => items().find((item) => item.id === api().dragSource))

  const onScroll = (event: Event & { currentTarget: HTMLDivElement }) => {
    setScrollTop(event.currentTarget.scrollTop)
    virtualizer.handleScroll(event)
  }

  return (
    <>
      <main class={styles.main}>
        <div {...api().getRootProps()} class={styles.root}>
          <h3>Virtualized List</h3>

          <div class={styles.toolbar}>
            <span class={styles.stat}>
              mounted {range().startIndex + 1}-{range().endIndex + 1}
            </span>
            <span class={styles.stat}>scroll {Math.round(scrollTop())}</span>
            <span class={styles.stat}>
              over {api().dropTarget ? `${api().dropTarget} ${api().dropPlacement}` : "none"}
            </span>
            <span class={styles.stat}>drop {lastDrop() ?? "none"}</span>
          </div>

          <div ref={ref} onScroll={onScroll} class={styles.viewport}>
            <div class={styles.sizer} style={{ height: `${virtualizer.getTotalSize()}px` }}>
              <Index each={virtualizer.getVirtualItems()}>
                {(virtualItem) => {
                  const item = () => items()[virtualItem().index]
                  return (
                    <Show when={item()}>
                      {(item) => (
                        <div style={virtualizer.getItemStyle(virtualItem())}>
                          <div class={styles.row}>
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

          <Show when={api().isDragging && draggedItem()}>
            {(dragged) => (
              <div {...api().getDragPreviewProps()} class={`${styles.draggable} ${styles.dragPreview}`}>
                <span class={styles.dragHandle}>
                  <GripVertical size={14} />
                </span>
                {dragged().label}
              </div>
            )}
          </Show>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
