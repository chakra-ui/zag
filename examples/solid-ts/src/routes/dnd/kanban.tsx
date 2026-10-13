import * as dnd from "@zag-js/dnd"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/solid"
import styles from "@styles/dnd-kanban.module.css"
import { GripVertical } from "lucide-solid"
import { createMemo, createSignal, createUniqueId, For, Show } from "solid-js"
import { StateVisualizer } from "~/components/state-visualizer"
import { Toolbar } from "~/components/toolbar"

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
  const [columns, setColumns] = createSignal(initialColumns)

  const valueText = createMemo(() => {
    const map = new Map<string, string>()
    for (const column of columns()) {
      map.set(columnValue(column.id), column.title)
      map.set(columnEndValue(column.id), column.title)
      for (const card of column.cards) map.set(card.id, card.title)
    }
    return map
  })

  const columnService = useMachine(dnd.machine, {
    id: createUniqueId(),
    orientation: "horizontal",
    collisionStrategy: columnCollision,
    getValueText: (value) => valueText().get(value) ?? value,
    onDrop(details) {
      setColumns((prev) => moveColumn(prev, details.source, details.target, details.placement))
    },
  })
  const columnApi = createMemo(() => dnd.connect(columnService, normalizeProps))
  const draggedColumn = createMemo(() => columns().find((column) => columnValue(column.id) === columnApi().dragSource))

  const cardService = useMachine(dnd.machine, {
    id: createUniqueId(),
    orientation: "vertical",
    getValueText: (value) => valueText().get(value) ?? value,
    canDrop(source, target) {
      return source !== target
    },
    onDrop(details) {
      setColumns((prev) => moveCard(prev, details.source, details.target, details.placement))
    },
  })
  const cardApi = createMemo(() => dnd.connect(cardService, normalizeProps))
  const draggedCard = createMemo(() => findCard(columns(), cardApi().dragSource ?? "")?.card ?? null)

  return (
    <>
      <main class={styles.main}>
        <div {...columnApi().getRootProps()} class={styles.root}>
          <h3>Kanban Board</h3>
          <div {...cardApi().getRootProps()} class={styles.cardRoot}>
            <div class={styles.board}>
              <For each={columns()}>
                {(column) => {
                  const columnTarget = columnValue(column.id)
                  const endTarget = columnEndValue(column.id)

                  return (
                    <div class={styles.columnItem}>
                      <div
                        {...columnApi().getDropIndicatorProps({ value: columnTarget, placement: "before" })}
                        class={styles.columnDropIndicator}
                      />
                      <section
                        {...columnApi().getDropTargetProps({ value: columnTarget })}
                        class={styles.column}
                        data-column-dragging={columnApi().dragSource === columnTarget ? "" : undefined}
                      >
                        <div {...columnApi().getDraggableProps({ value: columnTarget })} class={styles.columnHeader}>
                          <span class={styles.columnDragHandle}>
                            <GripVertical size={14} />
                          </span>
                          <h4 class={styles.columnTitle}>{column.title}</h4>
                          <span class={styles.count}>{column.cards.length}</span>
                        </div>

                        <div class={styles.items}>
                          <For each={column.cards}>
                            {(card) => (
                              <div class={styles.item}>
                                <div
                                  {...cardApi().getDropIndicatorProps({ value: card.id, placement: "before" })}
                                  class={styles.dropIndicator}
                                />
                                <div
                                  {...mergeProps(
                                    cardApi().getDraggableProps({ value: card.id }),
                                    cardApi().getDropTargetProps({ value: card.id }),
                                    { class: styles.card },
                                  )}
                                >
                                  <span {...cardApi().getDragHandleProps({ value: card.id })} class={styles.dragHandle}>
                                    <GripVertical size={14} />
                                  </span>
                                  <span class={styles.cardBody}>
                                    <span class={styles.cardTitle}>{card.title}</span>
                                    <span class={styles.cardMeta}>{card.meta}</span>
                                  </span>
                                </div>
                                <div
                                  {...cardApi().getDropIndicatorProps({ value: card.id, placement: "after" })}
                                  class={styles.dropIndicator}
                                />
                              </div>
                            )}
                          </For>
                          <div {...cardApi().getDropTargetProps({ value: endTarget })} class={styles.columnEndTarget}>
                            Drop to end
                          </div>
                        </div>
                      </section>
                      <div
                        {...columnApi().getDropIndicatorProps({ value: columnTarget, placement: "after" })}
                        class={styles.columnDropIndicator}
                      />
                    </div>
                  )
                }}
              </For>
            </div>

            <Show when={cardApi().isDragging && draggedCard()}>
              {(card) => (
                <div {...cardApi().getDragPreviewProps()} class={`${styles.card} ${styles.dragPreview}`}>
                  <span class={styles.dragHandle}>
                    <GripVertical size={14} />
                  </span>
                  <span class={styles.cardBody}>
                    <span class={styles.cardTitle}>{card().title}</span>
                    <span class={styles.cardMeta}>{card().meta}</span>
                  </span>
                </div>
              )}
            </Show>
          </div>

          <Show when={columnApi().isDragging && draggedColumn()}>
            {(column) => (
              <div {...columnApi().getDragPreviewProps()} class={`${styles.columnPreview} ${styles.column}`}>
                <div class={styles.columnHeader}>
                  <span class={styles.columnDragHandle}>
                    <GripVertical size={14} />
                  </span>
                  <h4 class={styles.columnTitle}>{column().title}</h4>
                  <span class={styles.count}>{column().cards.length}</span>
                </div>
              </div>
            )}
          </Show>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={columnService} />
        <StateVisualizer state={cardService} />
      </Toolbar>
    </>
  )
}
