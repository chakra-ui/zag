"use client"

import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as dnd from "@zag-js/dnd"
import { GripVerticalIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import styles from "@styles/dnd-list.module.css"

const initialItems = [
  { id: "1", label: "Apple" },
  { id: "2", label: "Banana" },
  { id: "3", label: "Cherry" },
  { id: "4", label: "Date" },
  { id: "5", label: "Elderberry" },
]

export default function Page() {
  const [items, setItems] = useState(initialItems)

  const service = useMachine(dnd.machine, {
    id: useId(),
    orientation: "vertical",
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (i) => i.id }))
    },
  })
  const api = dnd.connect(service, normalizeProps)

  return (
    <>
      <main className={styles.main}>
        <div {...api.getRootProps()} className={styles.root}>
          <h3>Sortable List</h3>
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
                    { className: `${styles.draggable} ${styles.dropTarget}` },
                  )}
                >
                  <span {...api.getDragHandleProps({ value: item.id })} className={styles.dragHandle}>
                    <GripVerticalIcon size={14} />
                  </span>
                  {item.label}
                </div>
                <div
                  {...api.getDropIndicatorProps({ value: item.id, placement: "after" })}
                  className={styles.dropIndicator}
                />
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={service} />
      </Toolbar>
    </>
  )
}
