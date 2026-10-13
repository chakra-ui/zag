import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import styles from "@styles/dnd-list.module.css"

const initialItems = [
  { id: "1", label: "Apple", emoji: "🍎" },
  { id: "2", label: "Banana", emoji: "🍌" },
  { id: "3", label: "Cherry", emoji: "🍒" },
  { id: "4", label: "Date", emoji: "🌴" },
  { id: "5", label: "Elderberry", emoji: "🫐" },
]

export default function Page() {
  const [items, setItems] = createSignal(initialItems)
  const itemMap = createMemo(() => new Map(items().map((i) => [i.id, i])))

  const service = useMachine(dnd.machine, {
    id: createUniqueId(),
    orientation: "vertical",
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (i) => i.id }))
    },
  })

  const api = createMemo(() => dnd.connect(service, normalizeProps))
  const draggedItem = createMemo(() => {
    const source = api().dragSource
    return source ? itemMap().get(source) : undefined
  })

  return (
    <>
      <main class={styles.main}>
        <div {...api().getRootProps()} class={styles.root}>
          <h3>Drag Overlay</h3>
          <ul class={styles.items}>
            <For each={items()}>
              {(item) => (
                <li class={styles.item}>
                  <div
                    {...api().getDropIndicatorProps({ value: item.id, placement: "before" })}
                    class={styles.dropIndicator}
                  />
                  <div
                    {...mergeProps(
                      api().getDraggableProps({ value: item.id }),
                      api().getDropTargetProps({ value: item.id }),
                      { class: `${styles.draggable} ${styles.dropTarget}` },
                    )}
                  >
                    <span {...api().getDragHandleProps({ value: item.id })} class={styles.dragHandle}>
                      <GripVertical size={14} />
                    </span>
                    <span>{item.emoji}</span>
                    {item.label}
                  </div>
                  <div
                    {...api().getDropIndicatorProps({ value: item.id, placement: "after" })}
                    class={styles.dropIndicator}
                  />
                </li>
              )}
            </For>
          </ul>

          <Show when={api().isDragging && draggedItem()}>
            {(dragged) => (
              <div {...api().getDragPreviewProps()} class={styles.dragPreview}>
                {dragged().emoji} {dragged().label}
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
