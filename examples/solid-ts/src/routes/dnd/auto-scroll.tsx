import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import styles from "@styles/dnd-list.module.css"

const initialItems = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  label: `Item ${i + 1}`,
}))

export default function Page() {
  const [items, setItems] = createSignal(initialItems)

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
          <h3>Auto-Scroll (30 items in scrollable container)</h3>
          <ul class={`${styles.items} ${styles.scrollList}`}>
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
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
