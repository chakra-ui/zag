import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import styles from "@styles/dnd-list.module.css"

const initialItems = [
  { id: "1", label: "Apple" },
  { id: "2", label: "Banana" },
  { id: "3", label: "Cherry" },
  { id: "4", label: "Date" },
  { id: "5", label: "Elderberry" },
]

export default function Page() {
  const [items, setItems] = createSignal(initialItems)

  const service = useMachine(dnd.machine, {
    id: createUniqueId(),
    orientation: "vertical",
    onDrop(details) {
      const { source, target, placement } = details
      if (placement === "on") return
      setItems((prev) => {
        const fromIndex = prev.findIndex((item) => item.id === source)
        const toIndex = prev.findIndex((item) => item.id === target)
        if (fromIndex === -1 || toIndex === -1) return prev
        return dnd.move(prev, fromIndex, dnd.getDestinationIndex(prev.length, fromIndex, toIndex, placement))
      })
    },
  })

  const api = createMemo(() => dnd.connect(service, normalizeProps))

  return (
    <>
      <main class={styles.main}>
        <div {...api().getRootProps()} class={styles.root}>
          <h3>Sortable List</h3>
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
