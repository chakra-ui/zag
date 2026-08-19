"use client"

import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import { useListVirtualizer } from "@/hooks/use-virtualizer"
import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import styles from "@styles/dnd-virtualized-list.module.css"
import { GripVerticalIcon } from "lucide-react"
import { useCallback, useId, useRef, useState } from "react"

const initialItems = Array.from({ length: 500 }, (_, index) => ({
  id: String(index + 1),
  label: `Item ${index + 1}`,
}))

export default function Page() {
  const [items, setItems] = useState(initialItems)
  const [lastDrop, setLastDrop] = useState<string | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const { virtualizer, ref } = useListVirtualizer({
    count: initialItems.length,
    estimatedSize: () => 44,
    overscan: 8,
  })

  virtualizer.updateOptions({ count: items.length })

  const service = useMachine(dnd.machine, {
    id: useId(),
    orientation: "vertical",
    scrollThreshold: 36,
    onDrop(details) {
      setLastDrop(`${details.source} -> ${details.target} ${details.placement}`)
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (item) => item.id }))
    },
  })
  const api = dnd.connect(service, normalizeProps)
  const virtualItems = virtualizer.getVirtualItems()
  const range = virtualizer.getRange()
  const draggedItem = items.find((item) => item.id === api.dragSource)
  const dragPreviewProps = api.getDragPreviewProps()

  const setViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node
      ref(node)
    },
    [ref],
  )

  return (
    <>
      <main className={styles.main}>
        <div {...api.getRootProps()} className={styles.root}>
          <h3>Virtualized List</h3>

          <div className={styles.toolbar}>
            <span className={styles.stat}>
              mounted {range.startIndex + 1}-{range.endIndex + 1}
            </span>
            <span className={styles.stat}>scroll {Math.round(viewportRef.current?.scrollTop ?? 0)}</span>
            <span className={styles.stat}>
              over {api.dropTarget ? `${api.dropTarget} ${api.dropPlacement}` : "none"}
            </span>
            <span className={styles.stat}>drop {lastDrop ?? "none"}</span>
          </div>

          <div ref={setViewportRef} onScroll={virtualizer.handleScroll} className={styles.viewport}>
            <div className={styles.sizer} style={{ height: virtualizer.getTotalSize() }}>
              {virtualItems.map((virtualItem) => {
                const item = items[virtualItem.index]
                if (!item) return null

                return (
                  <div key={item.id} style={virtualizer.getItemStyle(virtualItem)}>
                    <div className={styles.row}>
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
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {api.isDragging && draggedItem && (
            <div
              {...dragPreviewProps}
              className={`${styles.draggable} ${styles.dragPreview}`}
              style={dragPreviewProps.style}
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
