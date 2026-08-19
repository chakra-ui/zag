"use client"

import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import styles from "@styles/dnd-variable-size.module.css"
import { GripVerticalIcon } from "lucide-react"
import { useId, useState } from "react"

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
  const [items, setItems] = useState(initialItems)

  const service = useMachine(dnd.machine, {
    id: useId(),
    orientation: "vertical",
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (item) => item.id }))
    },
  })
  const api = dnd.connect(service, normalizeProps)
  const draggedItem = items.find((item) => item.id === api.dragSource)
  const dragPreviewProps = api.getDragPreviewProps()

  return (
    <>
      <main className={styles.main}>
        <div {...api.getRootProps()} className={styles.root}>
          <h3>Variable Size List</h3>
          <ul className={styles.items}>
            {items.map((item) => (
              <li key={item.id} className={styles.item}>
                <div
                  {...api.getDropIndicatorProps({ value: item.id, placement: "before" })}
                  className={styles.dropIndicator}
                />
                <div
                  {...mergeProps(
                    api.getDraggableProps({ value: item.id }),
                    api.getDropTargetProps({ value: item.id }),
                    {
                      className: styles.draggable,
                    },
                  )}
                >
                  <span {...api.getDragHandleProps({ value: item.id })} className={styles.dragHandle}>
                    <GripVerticalIcon size={14} />
                  </span>
                  <span className={styles.content}>
                    <span className={styles.title}>{item.title}</span>
                    <span className={styles.description}>{item.description}</span>
                  </span>
                </div>
                <div
                  {...api.getDropIndicatorProps({ value: item.id, placement: "after" })}
                  className={styles.dropIndicator}
                />
              </li>
            ))}
          </ul>

          {api.isDragging && draggedItem && (
            <div
              {...dragPreviewProps}
              className={`${styles.draggable} ${styles.dragPreview}`}
              style={dragPreviewProps.style}
            >
              <span className={styles.dragHandle}>
                <GripVerticalIcon size={14} />
              </span>
              <span className={styles.content}>
                <span className={styles.title}>{draggedItem.title}</span>
                <span className={styles.description}>{draggedItem.description}</span>
              </span>
            </div>
          )}
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
