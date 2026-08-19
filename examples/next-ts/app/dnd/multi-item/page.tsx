"use client"

import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as dnd from "@zag-js/dnd"
import { GripVerticalIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
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
  const [items, setItems] = useState(initialItems)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const itemMap = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const service = useMachine(dnd.machine, {
    id: useId(),
    orientation: "vertical",
    selectedValues: selectedIds,
    getValueText: (value) => itemMap.get(value)?.label ?? value,
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, source: details.values, itemToValue: (i) => i.id }))
      setSelectedIds([])
    },
  })
  const api = dnd.connect(service, normalizeProps)

  return (
    <>
      <main className={styles.main}>
        <div {...api.getRootProps()} className={styles.root}>
          <h3>Multi-Item Drag</h3>
          <p className={styles.helperText}>
            Click items to select, then drag any selected item.
            {selectedIds.length > 0 && <strong> ({selectedIds.length} selected)</strong>}
          </p>
          <ul className={styles.items}>
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id)
              return (
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
                    data-selected={isSelected ? "" : undefined}
                    onClick={() => toggleSelect(item.id)}
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
              )
            })}
          </ul>

          {api.isDragging && api.dragValues.length > 1 && (
            <div {...api.getDragPreviewProps()} className={styles.dragPreview}>
              {api.dragValues.length} items
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
