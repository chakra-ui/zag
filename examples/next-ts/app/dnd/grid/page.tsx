"use client"

import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import * as dnd from "@zag-js/dnd"
import { GripVerticalIcon } from "lucide-react"
import type { CSSProperties } from "react"
import { useId, useLayoutEffect, useRef, useState } from "react"
import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import styles from "@styles/dnd-grid.module.css"

const COLUMN_COUNT = 3

const initialItems = Array.from({ length: 9 }, (_, i) => ({
  id: String(i + 1),
  label: `Item ${i + 1}`,
  color: ["#fecaca", "#fed7aa", "#fef08a", "#bbf7d0", "#bfdbfe", "#ddd6fe", "#fbcfe8", "#e5e7eb", "#fde68a"][i],
}))

type GridItem = (typeof initialItems)[number]

function getInsertionIndex(
  items: GridItem[],
  dragValues: string[],
  dropTarget: string,
  dropPlacement: dnd.DropPlacement,
) {
  if (dropPlacement === "on") return null

  const dragSet = new Set(dragValues)
  const remaining = items.filter((item) => !dragSet.has(item.id))
  const targetIndex = remaining.findIndex((item) => item.id === dropTarget)
  if (targetIndex === -1) return null

  return dropPlacement === "after" ? targetIndex + 1 : targetIndex
}

function getGridSlotEl(gridEl: HTMLElement, index: number) {
  return Array.from(gridEl.querySelectorAll<HTMLElement>("[data-dnd-draggable]"))[index]
}

export default function Page() {
  const [items, setItems] = useState(initialItems)
  const [placeholderStyle, setPlaceholderStyle] = useState<CSSProperties | null>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)

  const service = useMachine(dnd.machine, {
    id: useId(),
    columnCount: COLUMN_COUNT,
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (i) => i.id }))
    },
  })
  const api = dnd.connect(service, normalizeProps)
  const draggedItem = api.dragSource ? items.find((item) => item.id === api.dragSource) : null
  const dragValueKey = api.dragValues.join("\u0000")
  const dragPreviewProps = api.getDragPreviewProps()

  useLayoutEffect(() => {
    const gridEl = gridRef.current
    if (!gridEl || !api.isDragging || !api.dropTarget || !api.dropPlacement) {
      setPlaceholderStyle(null)
      return
    }

    const insertionIndex = getInsertionIndex(items, api.dragValues, api.dropTarget, api.dropPlacement)
    if (insertionIndex == null) {
      setPlaceholderStyle(null)
      return
    }

    const targetEl = getGridSlotEl(gridEl, insertionIndex)
    if (!targetEl) return

    const gridRect = gridEl.getBoundingClientRect()
    const targetRect = targetEl.getBoundingClientRect()
    setPlaceholderStyle({
      top: targetRect.top - gridRect.top,
      left: targetRect.left - gridRect.left,
      width: targetRect.width,
      height: targetRect.height,
    })
  }, [api.isDragging, api.dropPlacement, api.dropTarget, dragValueKey, items])

  return (
    <>
      <main className={styles.main}>
        <div {...api.getRootProps()} className={styles.root}>
          <h3>Grid Layout ({COLUMN_COUNT} columns)</h3>
          <div ref={gridRef} className={styles.grid}>
            {items.map((item) => (
              <div key={item.id} className={styles.item}>
                <div
                  {...mergeProps(
                    api.getDraggableProps({ value: item.id }),
                    api.getDropTargetProps({ value: item.id }),
                    { className: styles.draggable },
                  )}
                  style={{ ["--item-color" as string]: item.color }}
                >
                  <span {...api.getDragHandleProps({ value: item.id })} className={styles.dragHandle}>
                    <GripVerticalIcon size={14} />
                  </span>
                  {item.label}
                </div>
              </div>
            ))}
            {placeholderStyle && <div className={styles.placeholder} style={placeholderStyle} />}
          </div>

          {api.isDragging && draggedItem && (
            <div
              {...dragPreviewProps}
              className={styles.dragPreview}
              style={{ ...dragPreviewProps.style, ["--item-color" as string]: draggedItem.color }}
            >
              <span className={styles.dragHandle}>
                <GripVerticalIcon size={14} />
              </span>
              {draggedItem.label}
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
