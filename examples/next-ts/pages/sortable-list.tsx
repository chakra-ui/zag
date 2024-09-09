import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element"
import { attachClosestEdge, extractClosestEdge, type Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index"
import { draggable, dropTargetForElements, monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { createMachine, ref } from "@zag-js/core"
import { dataAttr, isHTMLElement, isOverflowElement } from "@zag-js/dom-query"
import { useMachine } from "@zag-js/react"
import { hasProp, isNumber, isObject } from "@zag-js/utils"
import { GripVertical } from "lucide-react"
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
  items: T[]
  itemToValue(item: T): string
}

interface PrivateContext {
  _cleanup: Map<Element, VoidFunction>
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
        items: [],
        itemToValue(item) {
          return item.id.toString()
        },
        _cleanup: ref(new Map()),
        draggedValue: null,
        dragOverValue: null,
        dragClosestEdge: null,
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

          reorder(ctx.items, startIndex, finishIndex)

          ctx.onReorder?.({ items: ctx.items })
        },
      },
      activities: {
        trackAutoScroll: (ctx) => {
          const list = document.querySelector<HTMLElement>("[data-part=list]")
          if (!isOverflowElement(list)) return
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

              const indexOfTarget = ctx.items.findIndex((t) => ctx.itemToValue(t) === targetData.value)
              if (indexOfTarget < 0) {
                return send({ type: "drop.invalid" })
              }

              const closestEdgeOfTarget = extractClosestEdge(targetData)

              send({
                type: "drop.valid",
                draggedValue: sourceData.value,
                startIndex: sourceData.index,
                indexOfTarget,
                closestEdgeOfTarget,
              })
            },
          })
        },

        trackDraggables: (ctx, _evt, { send }) => {
          const list = document.querySelector<HTMLElement>("[data-part=list]")
          const items = list.querySelectorAll<HTMLElement>("[data-part=item]")
          items.forEach((item) => {
            const cleanup = registerItem(item, ctx, send)
            ctx._cleanup.set(item, cleanup)
          })
          return () => {
            ctx._cleanup.forEach((cleanup) => cleanup())
            ctx._cleanup.clear()
          }
        },

        trackMutations: (ctx, _evt, { send }) => {
          const observer = new window.MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              // if node is a new item, register it
              mutation.addedNodes.forEach((node) => {
                if (!isDraggableItem(node)) return
                const cleanup = registerItem(node, ctx, send)
                ctx._cleanup.set(node, cleanup)
              })

              // if node is an item, unregister it
              mutation.removedNodes.forEach((node) => {
                if (!isDraggableItem(node)) return
                ctx._cleanup.get(node)?.()
                ctx._cleanup.delete(node)
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
  const index = ctx.items.findIndex((item) => ctx.itemToValue(item) === itemValue)
  const data = { instanceId: "x1", index, value: itemValue }

  const dragCleanup = draggable({
    element: item.querySelector("[data-part=drag-trigger]")!,
    getInitialData() {
      const index = ctx.items.findIndex((item) => ctx.itemToValue(item) === itemValue)
      return { instanceId: "x1", index, value: itemValue }
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

function reorder<T>(list: T[], startIndex: number, finishIndex: number): T[] {
  if (startIndex === -1 || finishIndex === -1 || startIndex === finishIndex) {
    return list
  }

  const [removed] = list.splice(startIndex, 1)
  list.splice(finishIndex, 0, removed)

  return list
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

const items: Item[] = [
  { id: 1, text: "item 1" },
  { id: 2, text: "item 2" },
  { id: 3, text: "item 3" },
  { id: 4, text: "item 4" },
  { id: 5, text: "item 5" },
]

export default function Page() {
  const [state, send] = useMachine(sortableListMachine({ items }))

  const api = {
    draggedValue: state.context.draggedValue,
    dragClosestEdge: state.context.dragClosestEdge,
    dragOverValue: state.context.dragOverValue,
    getItemState(item: Item) {
      const value = state.context.itemToValue(item)
      const dragging = api.draggedValue === value
      const dragOver = api.dragOverValue === value
      const indicator = api.draggedValue !== value && api.dragOverValue === value && api.dragClosestEdge
      return {
        value,
        dragging,
        dragOver,
        indicator,
      }
    },
    moveToTop(index: number) {
      send({
        type: "item.reorder",
        startIndex: index,
        indexOfTarget: 0,
        closestEdgeOfTarget: null,
      })
    },
    moveUp(index: number) {
      send({
        type: "item.reorder",
        startIndex: index,
        indexOfTarget: index - 1,
        closestEdgeOfTarget: null,
      })
    },
    moveDown(index: number) {
      send({
        type: "item.reorder",
        startIndex: index,
        indexOfTarget: index + 1,
        closestEdgeOfTarget: null,
      })
    },
    moveToBottom(index: number) {
      send({
        type: "item.reorder",
        startIndex: index,
        indexOfTarget: items.length - 1,
        closestEdgeOfTarget: null,
      })
    },
    getItemPosition(index: number) {
      if (items.length === 1) return "only"
      if (index === 0) return "first"
      if (index === items.length - 1) return "last"
      return "middle"
    },
    canMoveUp(index: number) {
      const position = api.getItemPosition(index)
      return position !== "first" && position !== "only"
    },
    canMoveDown(index: number) {
      const position = api.getItemPosition(index)
      return position !== "last" && position !== "only"
    },
  }

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
            {state.context.items.map((item) => {
              const itemState = api.getItemState(item)
              return (
                <div
                  role="button"
                  aria-roledescription="sortable"
                  data-dragging={dataAttr(itemState.dragging)}
                  data-dragover={dataAttr(itemState.dragOver)}
                  data-value={itemState.value}
                  key={itemState.value}
                  data-part="item"
                  style={{
                    position: "relative",
                    backgroundColor: itemState.dragging ? "lightblue" : "white",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    outline: "1px solid lightgray",
                  }}
                >
                  <span
                    data-part="drag-item-gap-ghost"
                    style={{
                      display: "block",
                      height: "1px",
                      position: "absolute",
                      bottom: "-1px",
                      zIndex: 1,
                      insetInline: "0",
                    }}
                  />

                  <button data-part="drag-trigger">
                    <GripVertical />
                  </button>

                  <span data-part="drag-item-text">{item.text}</span>

                  {itemState.indicator && <DropIndicator gap="1px" edge={api.dragClosestEdge} />}
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <Toolbar>
        <StateVisualizer state={state} omit={["items"]} />
      </Toolbar>
    </>
  )
}
