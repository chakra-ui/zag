import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import styles from "@styles/dnd-variable-size.module.css"
import { GripVertical } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

const initialItems = [
  {
    id: "scope",
    title: "Define scope",
    description: "Short item.",
  },
  {
    id: "audit",
    title: "Audit current behavior",
    description:
      "Review pointer collision, keyboard movement, auto-scroll, and drag preview behavior across list and grid examples.",
  },
  {
    id: "prototype",
    title: "Prototype changes",
    description:
      "Build a small example that intentionally mixes compact rows with taller rows so before and after placement can be checked near uneven item boundaries.",
  },
  {
    id: "docs",
    title: "Update notes",
    description: "Capture the recommendation and remaining risks.",
  },
  {
    id: "qa",
    title: "Run checks",
    description:
      "Validate with pointer dragging from the top, middle, and bottom of each row. Include slow diagonal movement across item gaps.",
  },
  {
    id: "ship",
    title: "Ship",
    description: "Prepare the final patch once the behavior is predictable.",
  },
]

export default function Page() {
  const [items, setItems] = createSignal(initialItems)

  const service = useMachine(dnd.machine, {
    id: createUniqueId(),
    orientation: "vertical",
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (item) => item.id }))
    },
  })

  const api = createMemo(() => dnd.connect(service, normalizeProps))
  const draggedItem = createMemo(() => items().find((item) => item.id === api().dragSource))

  return (
    <>
      <main class={styles.main}>
        <div {...api().getRootProps()} class={styles.root}>
          <h3>Variable Size List</h3>
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
                      { class: styles.draggable },
                    )}
                  >
                    <span {...api().getDragHandleProps({ value: item.id })} class={styles.dragHandle}>
                      <GripVertical size={14} />
                    </span>
                    <span class={styles.content}>
                      <span class={styles.title}>{item.title}</span>
                      <span class={styles.description}>{item.description}</span>
                    </span>
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
              <div {...api().getDragPreviewProps()} class={`${styles.draggable} ${styles.dragPreview}`}>
                <span class={styles.dragHandle}>
                  <GripVertical size={14} />
                </span>
                <span class={styles.content}>
                  <span class={styles.title}>{dragged().title}</span>
                  <span class={styles.description}>{dragged().description}</span>
                </span>
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
