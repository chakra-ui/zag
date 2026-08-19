"use client"

import { StateVisualizer } from "@/components/state-visualizer"
import { Toolbar } from "@/components/toolbar"
import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/react"
import styles from "@styles/dnd-kanban.module.css"
import { GripVerticalIcon } from "lucide-react"
import { useId, useMemo, useState } from "react"

type Card = {
  id: string
  title: string
  meta: string
}

type Column = {
  id: string
  title: string
  cards: Card[]
}

const columnValue = (columnId: string) => `column:${columnId}`
const columnEndValue = (columnId: string) => `column-end:${columnId}`
const getColumnId = (value: string) => (value.startsWith("column:") ? value.slice("column:".length) : null)
const getColumnEndId = (value: string) => (value.startsWith("column-end:") ? value.slice("column-end:".length) : null)

const columnCollision: dnd.CollisionStrategy = (pointer, entries) => {
  const match = entries.find((entry) => {
    const { rect } = entry
    return (
      pointer.x >= rect.x &&
      pointer.x <= rect.x + rect.width &&
      pointer.y >= rect.y &&
      pointer.y <= rect.y + rect.height
    )
  })

  if (!match) return null

  const centerX = match.rect.x + match.rect.width / 2
  return {
    value: match.value,
    placement: pointer.x < centerX ? "before" : "after",
  }
}

const initialColumns: Column[] = [
  {
    id: "todo",
    title: "Todo",
    cards: [
      { id: "brief", title: "Write project brief", meta: "Docs" },
      { id: "research", title: "Collect accessibility notes", meta: "Research" },
      { id: "api", title: "Review API details", meta: "Engineering" },
    ],
  },
  {
    id: "doing",
    title: "Doing",
    cards: [
      { id: "prototype", title: "Prototype drag preview", meta: "Frontend" },
      { id: "qa", title: "Run browser checks", meta: "QA" },
    ],
  },
  {
    id: "done",
    title: "Done",
    cards: [{ id: "tokens", title: "Split CSS modules", meta: "Cleanup" }],
  },
]

function findCard(columns: Column[], cardId: string) {
  for (const column of columns) {
    const index = column.cards.findIndex((card) => card.id === cardId)
    if (index !== -1) return { column, index, card: column.cards[index] }
  }
  return null
}

function moveColumn(columns: Column[], source: string, target: string, placement: dnd.DropPlacement) {
  const sourceId = getColumnId(source)
  const targetId = getColumnId(target)
  if (!sourceId || !targetId || sourceId === targetId || placement === "on") return columns

  const fromIndex = columns.findIndex((column) => column.id === sourceId)
  const toIndex = columns.findIndex((column) => column.id === targetId)
  if (fromIndex === -1 || toIndex === -1) return columns

  return dnd.move(columns, fromIndex, dnd.getDestinationIndex(columns.length, fromIndex, toIndex, placement))
}

function moveCard(columns: Column[], source: string, target: string, placement: dnd.DropPlacement) {
  if (source === target) return columns

  const sourceEntry = findCard(columns, source)
  if (!sourceEntry) return columns

  const targetColumnId = getColumnEndId(target)
  const targetEntry = targetColumnId ? null : findCard(columns, target)
  const destinationColumnId = targetColumnId ?? targetEntry?.column.id
  if (!destinationColumnId) return columns

  const next = columns.map((column) => ({
    ...column,
    cards: column.cards.filter((card) => card.id !== source),
  }))

  const destinationColumn = next.find((column) => column.id === destinationColumnId)
  if (!destinationColumn) return columns

  if (targetColumnId || !targetEntry || placement === "on") {
    destinationColumn.cards.push(sourceEntry.card)
    return next
  }

  const targetIndex = destinationColumn.cards.findIndex((card) => card.id === target)
  const insertIndex =
    targetIndex === -1 ? destinationColumn.cards.length : targetIndex + (placement === "after" ? 1 : 0)
  destinationColumn.cards.splice(insertIndex, 0, sourceEntry.card)
  return next
}

export default function Page() {
  const [columns, setColumns] = useState(initialColumns)

  const valueText = useMemo(() => {
    const map = new Map<string, string>()
    for (const column of columns) {
      map.set(columnValue(column.id), column.title)
      map.set(columnEndValue(column.id), column.title)
      for (const card of column.cards) map.set(card.id, card.title)
    }
    return map
  }, [columns])

  const columnService = useMachine(dnd.machine, {
    id: useId(),
    orientation: "horizontal",
    collisionStrategy: columnCollision,
    getValueText: (value) => valueText.get(value) ?? value,
    onDrop(details) {
      setColumns((prev) => moveColumn(prev, details.source, details.target, details.placement))
    },
  })
  const columnApi = dnd.connect(columnService, normalizeProps)
  const draggedColumn = columns.find((column) => columnValue(column.id) === columnApi.dragSource)
  const columnPreviewProps = columnApi.getDragPreviewProps()

  const cardService = useMachine(dnd.machine, {
    id: useId(),
    orientation: "vertical",
    getValueText: (value) => valueText.get(value) ?? value,
    canDrop(source, target) {
      return source !== target
    },
    onDrop(details) {
      setColumns((prev) => moveCard(prev, details.source, details.target, details.placement))
    },
  })
  const cardApi = dnd.connect(cardService, normalizeProps)
  const draggedCard = findCard(columns, cardApi.dragSource ?? "")?.card ?? null
  const cardPreviewProps = cardApi.getDragPreviewProps()

  return (
    <>
      <main className={styles.main}>
        <div {...columnApi.getRootProps()} className={styles.root}>
          <h3>Kanban Board</h3>
          <div {...cardApi.getRootProps()} className={styles.cardRoot}>
            <div className={styles.board}>
              {columns.map((column) => {
                const columnTarget = columnValue(column.id)
                const endTarget = columnEndValue(column.id)

                return (
                  <div key={column.id} className={styles.columnItem}>
                    <div
                      {...columnApi.getDropIndicatorProps({ value: columnTarget, placement: "before" })}
                      className={styles.columnDropIndicator}
                    />
                    <section
                      {...columnApi.getDropTargetProps({ value: columnTarget })}
                      className={styles.column}
                      data-column-dragging={columnApi.dragSource === columnTarget ? "" : undefined}
                    >
                      <div {...columnApi.getDraggableProps({ value: columnTarget })} className={styles.columnHeader}>
                        <span className={styles.columnDragHandle}>
                          <GripVerticalIcon size={14} />
                        </span>
                        <h4 className={styles.columnTitle}>{column.title}</h4>
                        <span className={styles.count}>{column.cards.length}</span>
                      </div>

                      <div className={styles.items}>
                        {column.cards.map((card) => (
                          <div key={card.id} className={styles.item}>
                            <div
                              {...cardApi.getDropIndicatorProps({ value: card.id, placement: "before" })}
                              className={styles.dropIndicator}
                            />
                            <div
                              {...mergeProps(
                                cardApi.getDraggableProps({ value: card.id }),
                                cardApi.getDropTargetProps({ value: card.id }),
                                {
                                  className: styles.card,
                                },
                              )}
                            >
                              <span {...cardApi.getDragHandleProps({ value: card.id })} className={styles.dragHandle}>
                                <GripVerticalIcon size={14} />
                              </span>
                              <span className={styles.cardBody}>
                                <span className={styles.cardTitle}>{card.title}</span>
                                <span className={styles.cardMeta}>{card.meta}</span>
                              </span>
                            </div>
                            <div
                              {...cardApi.getDropIndicatorProps({ value: card.id, placement: "after" })}
                              className={styles.dropIndicator}
                            />
                          </div>
                        ))}
                        <div {...cardApi.getDropTargetProps({ value: endTarget })} className={styles.columnEndTarget}>
                          Drop to end
                        </div>
                      </div>
                    </section>
                    <div
                      {...columnApi.getDropIndicatorProps({ value: columnTarget, placement: "after" })}
                      className={styles.columnDropIndicator}
                    />
                  </div>
                )
              })}
            </div>

            {cardApi.isDragging && draggedCard && (
              <div
                {...cardPreviewProps}
                className={`${styles.card} ${styles.dragPreview}`}
                style={cardPreviewProps.style}
              >
                <span className={styles.dragHandle}>
                  <GripVerticalIcon size={14} />
                </span>
                <span className={styles.cardBody}>
                  <span className={styles.cardTitle}>{draggedCard.title}</span>
                  <span className={styles.cardMeta}>{draggedCard.meta}</span>
                </span>
              </div>
            )}
          </div>

          {columnApi.isDragging && draggedColumn && (
            <div
              {...columnPreviewProps}
              className={`${styles.columnPreview} ${styles.column}`}
              style={columnPreviewProps.style}
            >
              <div className={styles.columnHeader}>
                <span className={styles.columnDragHandle}>
                  <GripVerticalIcon size={14} />
                </span>
                <h4 className={styles.columnTitle}>{draggedColumn.title}</h4>
                <span className={styles.count}>{draggedColumn.cards.length}</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={columnService} />
        <StateVisualizer state={cardService} />
      </Toolbar>
    </>
  )
}
