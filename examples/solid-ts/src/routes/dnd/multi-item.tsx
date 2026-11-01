import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
import styles from "@styles/dnd-list.module.css"

const initialItems = [
  { id: "1", label: "Apple" },
  { id: "2", label: "Banana" },
  { id: "3", label: "Cherry" },
  { id: "4", label: "Date" },
  { id: "5", label: "Elderberry" },
  { id: "6", label: "Fig" },
]

export default function Page() {
  const [items, setItems] = createSignal(initialItems)
  const [selectedIds, setSelectedIds] = createSignal<string[]>([])
  const itemMap = createMemo(() => new Map(items().map((i) => [i.id, i])))

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const id = createUniqueId()
  const service = useMachine(dnd.machine, (): dnd.Props => ({
    id,
    orientation: "vertical",
    selectedValues: selectedIds(),
    getValueText: (value) => itemMap().get(value)?.label ?? value,
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, source: details.values, itemToValue: (i) => i.id }))
      setSelectedIds([])
    },
  }))

  const api = createMemo(() => dnd.connect(service, normalizeProps))

  return (
    <>
      <main class={styles.main}>
        <div {...api().getRootProps()} class={styles.root}>
          <h3>Multi-Item Drag</h3>
          <p class={styles.helperText}>
            Click items to select, then drag any selected item.
            <Show when={selectedIds().length > 0}>
              <strong> ({selectedIds().length} selected)</strong>
            </Show>
          </p>
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
                    data-selected={selectedIds().includes(item.id) ? "" : undefined}
                    onClick={() => toggleSelect(item.id)}
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

          <Show when={api().isDragging && api().dragValues.length > 1}>
            <div {...api().getDragPreviewProps()} class={styles.dragPreview}>
              {api().dragValues.length} items
            </div>
          </Show>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
