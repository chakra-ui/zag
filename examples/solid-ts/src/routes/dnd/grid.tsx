import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import * as dnd from "@zag-js/dnd"
import { GripVertical } from "lucide-solid"
import type { JSX } from "solid-js"
import { createEffect, createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"
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
  const [items, setItems] = createSignal(initialItems)
  const [placeholderStyle, setPlaceholderStyle] = createSignal<JSX.CSSProperties | null>(null)
  let gridRef: HTMLDivElement | undefined

  const service = useMachine(dnd.machine, {
    id: createUniqueId(),
    columnCount: COLUMN_COUNT,
    onDrop(details) {
      setItems((prev) => dnd.reorder(prev, { ...details, itemToValue: (i) => i.id }))
    },
  })

  const api = createMemo(() => dnd.connect(service, normalizeProps))
  const draggedItem = createMemo(() => {
    const source = api().dragSource
    return source ? items().find((item) => item.id === source) : undefined
  })

  createEffect(() => {
    const { isDragging, dropTarget, dropPlacement, dragValues } = api()
    const currentItems = items()
    const gridEl = gridRef
    if (!gridEl || !isDragging || !dropTarget || !dropPlacement) {
      setPlaceholderStyle(null)
      return
    }

    const insertionIndex = getInsertionIndex(currentItems, dragValues, dropTarget, dropPlacement)
    if (insertionIndex == null) {
      setPlaceholderStyle(null)
      return
    }

    const targetEl = getGridSlotEl(gridEl, insertionIndex)
    if (!targetEl) return

    const gridRect = gridEl.getBoundingClientRect()
    const targetRect = targetEl.getBoundingClientRect()
    setPlaceholderStyle({
      top: `${targetRect.top - gridRect.top}px`,
      left: `${targetRect.left - gridRect.left}px`,
      width: `${targetRect.width}px`,
      height: `${targetRect.height}px`,
    })
  })

  return (
    <>
      <main class={styles.main}>
        <div {...api().getRootProps()} class={styles.root}>
          <h3>Grid Layout ({COLUMN_COUNT} columns)</h3>
          <div ref={gridRef} class={styles.grid}>
            <For each={items()}>
              {(item) => (
                <div class={styles.item}>
                  <div
                    {...mergeProps(
                      api().getDraggableProps({ value: item.id }),
                      api().getDropTargetProps({ value: item.id }),
                      { class: styles.draggable, style: { "--item-color": item.color } },
                    )}
                  >
                    <span {...api().getDragHandleProps({ value: item.id })} class={styles.dragHandle}>
                      <GripVertical size={14} />
                    </span>
                    {item.label}
                  </div>
                </div>
              )}
            </For>
            <Show when={placeholderStyle()}>{(style) => <div class={styles.placeholder} style={style()} />}</Show>
          </div>

          <Show when={api().isDragging && draggedItem()}>
            {(dragged) => (
              <div
                {...mergeProps(api().getDragPreviewProps(), {
                  class: styles.dragPreview,
                  style: { "--item-color": dragged().color },
                })}
              >
                <span class={styles.dragHandle}>
                  <GripVertical size={14} />
                </span>
                {dragged().label}
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
