import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element"
import { attachClosestEdge, extractClosestEdge, type Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index"
import { draggable, dropTargetForElements, monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { reorder } from "@atlaskit/pragmatic-drag-and-drop/reorder"
import { Collection } from "@zag-js/collection"
import { createMachine, ref } from "@zag-js/core"
import { dataAttr, isHTMLElement } from "@zag-js/dom-query"
import { useMachine } from "@zag-js/react"
import { hasProp, isNumber, isObject } from "@zag-js/utils"
import { GripVertical } from "lucide-react"
import { useMemo, useState } from "react"
import { StateVisualizer } from "../components/state-visualizer"
import { Toolbar } from "../components/toolbar"

interface ReorderDetails<T> {
  items: T[]
}

interface Item {
  id: number
  text: string
}

interface PublicContext<T = Item> {
  id: string
  onReorder?(details: ReorderDetails<T>): void
  collection: Collection<T>
}

interface PrivateContext {
  registry: Map<string, { el: Element; cleanup: VoidFunction }>
  draggedValue: string | null
  dragClosestEdge: Edge | null
  dragOverValue: string | null
}

interface Context extends PublicContext, PrivateContext {}

interface State {
  value: "idle" | "dragging"
}

const sortableListMachine = (ctx: Partial<PublicContext>) => {
  return createMachine<Context, State>(
    {
      initial: "idle",
      context: {
        id: "x1",
        registry: ref(new Map()),
        draggedValue: null,
        dragOverValue: null,
        dragClosestEdge: null,
        collection: ref(new Collection<Item>({ items: [] })),
        ...ctx,
      },

      activities: ["trackDraggables", "trackMutations"],

      states: {
        idle: {
          on: {
            "drag.start": {
              target: "dragging",
              actions: ["setDraggedValue"],
            },
          },
        },
        dragging: {
          activities: ["trackDropTarget", "trackAutoScroll"],
          exit: ["clearClosestEdge", "clearDraggedValue", "clearDragOverValue"],
          on: {
            "drop.valid": {
              target: "idle",
              actions: ["reorderItem"],
            },
            "drop.invalid": {
              target: "idle",
            },
            "edge.set": {
              actions: ["setClosestEdge"],
            },
            "dragover.start": {
              actions: ["setDragOverValue"],
            },
          },
        },
      },
    },
    {
      actions: {
        setDraggedValue: (ctx, evt) => {
          ctx.draggedValue = evt.value
        },
        clearDraggedValue: (ctx) => {
          ctx.draggedValue = null
        },
        setClosestEdge: (ctx, evt) => {
          ctx.dragClosestEdge = evt.value
        },
        clearClosestEdge: (ctx) => {
          ctx.dragClosestEdge = null
        },
        setDragOverValue: (ctx, evt) => {
          ctx.dragOverValue = evt.value
        },
        clearDragOverValue: (ctx) => {
          ctx.dragOverValue = null
        },
        reorderItem: (ctx, evt) => {
          const { startIndex, indexOfTarget, closestEdgeOfTarget } = evt

          const finishIndex = getReorderDestinationIndex({
            startIndex: startIndex,
            closestEdgeOfTarget,
            indexOfTarget,
            axis: "vertical",
          })

          if (finishIndex === startIndex) return

          const nextItems = reorder({
            list: Array.from(ctx.collection),
            startIndex,
            finishIndex,
          })

          ctx.onReorder?.({ items: nextItems })
        },
      },
      activities: {
        trackAutoScroll: (ctx) => {
          const list = document.querySelector<HTMLElement>("[data-part=list]")
          return autoScrollForElements({
            element: list,
            canScroll: ({ source }) => {
              return isItemData(source.data) && source.data.instanceId === ctx.id
            },
          })
        },

        trackDropTarget: (ctx, _evt, { send }) => {
          return monitorForElements({
            canMonitor({ source }) {
              return isItemData(source.data) && source.data.instanceId === ctx.id
            },
            onDrop({ location, source }) {
              const target = location.current.dropTargets[0]
              if (!target) {
                return send({ type: "drop.invalid" })
              }

              const sourceData = source.data
              const targetData = target.data

              if (!isItemData(sourceData) || !isItemData(targetData)) {
                return send({ type: "drop.invalid" })
              }

              const indexOfTarget = ctx.collection.indexOf(targetData.value)
              if (indexOfTarget < 0) {
                return send({ type: "drop.invalid" })
              }

              const closestEdgeOfTarget = extractClosestEdge(targetData)

              send({ type: "drop.valid", startIndex: sourceData.index, indexOfTarget, closestEdgeOfTarget })
            },
          })
        },

        trackDraggables: (ctx, _evt, { send }) => {
          const list = document.querySelector<HTMLElement>("[data-part=list]")
          const items = list.querySelectorAll<HTMLElement>("[data-part=item]")
          items.forEach((item) => {
            const cleanup = registerItem(item, ctx, send)
            ctx.registry.set(item.dataset.value, { el: item, cleanup })
          })
          return () => {
            ctx.registry.forEach((value) => value.cleanup())
            ctx.registry.clear()
          }
        },

        trackMutations: (ctx, _evt, { send }) => {
          const observer = new window.MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              // if node is a new item, register it
              mutation.addedNodes.forEach((node) => {
                if (!isDraggableItem(node)) return
                const cleanup = registerItem(node, ctx, send)
                ctx.registry.set(node.dataset.value, { el: node, cleanup })
              })

              // if node is an item, unregister it
              mutation.removedNodes.forEach((node) => {
                if (!isDraggableItem(node)) return
                const item = ctx.registry.get(node.dataset.value)!
                item.cleanup()
                ctx.registry.delete(node.dataset.value)
              })
            })
          })

          const list = document.querySelector<HTMLElement>("[data-part=list]")
          observer.observe(list, { childList: true })

          return () => {
            observer.disconnect()
          }
        },
      },
    },
  )
}

function isDraggableItem(el: unknown): el is HTMLElement {
  return isHTMLElement(el) && el.dataset.part === "item"
}

function isItemData(v: any): v is { instanceId: string; index: number; value: string } {
  return isObject(v) && hasProp(v, "instanceId") && hasProp(v, "index") && hasProp(v, "value")
}

function registerItem(item: HTMLElement, ctx: Context, send: (evt: any) => void) {
  const itemValue = item.dataset.value
  const data = { instanceId: "x1", index: ctx.collection.indexOf(itemValue), value: itemValue }

  const dragCleanup = draggable({
    element: item.querySelector("[data-part=drag-trigger]")!,
    getInitialData() {
      return data
    },
    onDragStart() {
      send({ type: "drag.start", value: itemValue })
    },
    onDrop() {
      send({ type: "drag.end" })
    },
  })

  const dropCleanup = dropTargetForElements({
    element: item,
    getData({ input }) {
      return attachClosestEdge(data, {
        element: item,
        input,
        allowedEdges: ["top", "bottom"],
      })
    },
    onDragEnter() {
      send({ type: "dragover.start", value: itemValue })
    },
    onDrag({ self, source }) {
      const isSource = source.element === item
      if (isSource) return

      const closestEdge = extractClosestEdge(self.data)

      const sourceIndex = source.data.index
      if (!isNumber(sourceIndex)) return

      const isItemBeforeSource = data.index === sourceIndex - 1
      if (isItemBeforeSource && closestEdge === "bottom") return

      const isItemAfterSource = data.index === sourceIndex + 1
      if (isItemAfterSource && closestEdge === "top") return

      send({ type: "edge.set", value: closestEdge })
    },
    onDragLeave() {
      send({ type: "edge.set", value: null })
    },
    onDrop() {
      send({ type: "edge.set", value: null })
    },
  })

  return () => {
    dragCleanup()
    dropCleanup()
  }
}

const orientationStyles = {
  horizontal: {
    indicator: {
      height: "var(--line-thickness)",
      left: "var(--half-terminal-size)",
      right: 0,
    },
    terminal: {
      left: "calc(-1 * var(--terminal-size))",
    },
  },

  vertical: {
    indicator: {
      width: "var(--line-thickness)",
      top: "var(--half-terminal-size)",
      bottom: 0,
    },
    terminal: {
      top: "calc(-1 * var(--terminal-size))",
    },
  },
}

const edgeToOrientationMap = {
  top: "horizontal",
  bottom: "horizontal",
  left: "vertical",
  right: "vertical",
}

const edgeStyles = {
  top: {
    indicator: {
      top: "var(--line-offset)",
    },
    terminal: {
      top: "var(--terminal-offset)",
    },
  },
  bottom: {
    indicator: {
      bottom: "var(--line-offset)",
    },
    terminal: {
      bottom: "var(--terminal-offset)",
    },
  },
  right: {
    indicator: {
      right: "var(--line-offset)",
    },
    terminal: {
      right: "var(--terminal-offset)",
    },
  },
  left: {
    indicator: {
      left: "var(--line-offset)",
    },
    terminal: {
      left: "var(--terminal-offset)",
    },
  },
}

function DropIndicator(props: any) {
  const { edge, gap = "0px" } = props
  const orientationStyle = orientationStyles[edgeToOrientationMap[edge]]
  const edgeStyle = edgeStyles[edge]
  return (
    <div
      data-part="drop-indicator"
      data-edge={edge}
      style={{
        ["--gap" as string]: gap,
        ["--half-gap" as string]: "calc(0.5 * var(--gap))",

        ["--terminal-size" as string]: "8px",
        ["--half-terminal-size" as string]: "calc(var(--terminal-size) / 2)",

        ["--line-thickness" as string]: "2px",
        ["--half-line-thickness" as string]: "calc(var(--line-thickness) / 2)",

        ["--line-offset" as string]: "calc(-0.5 * var(--line-thickness) - var(--half-gap))",
        ["--terminal-offset" as string]: "calc(0.5 * calc(var(--line-thickness) - var(--terminal-size)))",

        display: "block",
        position: "absolute",
        zIndex: 1,
        pointerEvents: "none",
        background: "blue",
        ...orientationStyle.indicator,
        ...edgeStyle.indicator,
      }}
    >
      <div
        data-part="drop-indicator-terminal"
        data-edge={edge}
        style={{
          width: "var(--terminal-size)",
          height: "var(--terminal-size)",
          position: "absolute",
          borderRadius: "50%",
          border: "var(--line-thickness) solid blue",
          ...orientationStyle.terminal,
          ...edgeStyle.terminal,
        }}
      />
    </div>
  )
}

const initialItems: Item[] = [
  { id: 1, text: "item 1" },
  { id: 2, text: "item 2" },
  { id: 3, text: "item 3" },
  { id: 4, text: "item 4" },
  { id: 5, text: "item 5" },
]

export default function Page() {
  const [items, setItems] = useState<Item[]>(initialItems)

  const collection = useMemo(
    () =>
      new Collection({
        items,
        itemToString: (item) => item.text,
        itemToValue: (item) => item.id.toString(),
      }),
    [items],
  )

  const [state, send] = useMachine(
    sortableListMachine({
      collection,
      onReorder(details) {
        setItems(details.items)
      },
    }),
    {
      context: {
        collection,
      },
    },
  )
  const { draggedValue, dragClosestEdge, dragOverValue } = state.context

  const moveToTop = (index: number) => {
    send({
      type: "item.reorder",
      startIndex: index,
      indexOfTarget: 0,
      closestEdgeOfTarget: null,
    })
  }

  const moveUp = (index: number) => {
    send({
      type: "item.reorder",
      startIndex: index,
      indexOfTarget: index - 1,
      closestEdgeOfTarget: null,
    })
  }

  const moveDown = (index: number) => {
    send({
      type: "item.reorder",
      startIndex: index,
      indexOfTarget: index + 1,
      closestEdgeOfTarget: null,
    })
  }

  const moveToBottom = (index: number) => {
    send({
      type: "item.reorder",
      startIndex: index,
      indexOfTarget: items.length - 1,
      closestEdgeOfTarget: null,
    })
  }

  const getItemPosition = (index: number) => {
    if (items.length === 1) return "only"
    if (index === 0) return "first"
    if (index === items.length - 1) return "last"
    return "middle"
  }

  const canMoveUp = (index: number) => {
    const position = getItemPosition(index)
    return position !== "first" && position !== "only"
  }

  const canMoveDown = (index: number) => {
    const position = getItemPosition(index)
    return position !== "last" && position !== "only"
  }

  const api = {
    moveToTop,
    moveUp,
    moveDown,
    moveToBottom,
    canMoveUp,
    canMoveDown,
  }

  void api

  return (
    <>
      <main>
        <div style={{ padding: "40px" }}>
          <div
            data-part="list"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1px",
            }}
          >
            {items.map((item) => {
              const itemValue = collection.itemToValue(item)
              const isDragging = draggedValue === itemValue
              const isDragOver = dragOverValue === itemValue
              const showIndicator = draggedValue !== itemValue && dragOverValue === itemValue && dragClosestEdge

              return (
                <div
                  role="button"
                  aria-roledescription="sortable"
                  data-dragging={dataAttr(isDragging)}
                  data-dragover={dataAttr(isDragOver)}
                  data-value={itemValue}
                  key={item.id}
                  data-part="item"
                  style={{
                    position: "relative",
                    backgroundColor: isDragging ? "lightblue" : "white",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <button data-part="drag-trigger">
                    <GripVertical />
                  </button>

                  <span data-part="drag-item-text">{item.text}</span>

                  {showIndicator && <DropIndicator gap="1px" edge={dragClosestEdge} />}
                  {/* <DropIndicator gap="1px" edge="top" />
                  <DropIndicator gap="1px" edge="bottom" /> */}
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={state} />
      </Toolbar>
    </>
  )
}
