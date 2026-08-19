"use client"

import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as dnd from "@zag-js/dnd"
import { GripVerticalIcon } from "lucide-react"
import { useId, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import styles from "@styles/dnd-list.module.css"

const initialItems = Array.from({ length: 30 }, (_, i) => ({
  id: String(i + 1),
  label: `Item ${i + 1}`,
}))

export default function Page() {
  const [items, setItems] = useState(initialItems)

  const service = useMachine(dnd.machine, {
    id: useId(),
    orientation: "vertical",
    scrollThreshold: 30,
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (i) => i.id }))
    },
  })
  const api = dnd.connect(service, normalizeProps)

  return (
    <>
      <main className={styles.main}>
        <div {...api.getRootProps()} className={styles.root}>
          <h3>Auto-Scroll (30 items in scrollable container)</h3>
          <ul className={`${styles.items} ${styles.scrollList}`}>
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
