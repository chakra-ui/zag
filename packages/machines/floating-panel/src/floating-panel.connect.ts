import { dataAttr, getEventKey, getEventStep, getEventTarget, isSelfTarget } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./floating-panel.anatomy"
import { dom } from "./floating-panel.dom"
import type { MachineApi, ResizeTriggerProps, Send, State } from "./floating-panel.types"
import { getResizeAxisStyle } from "./get-resize-axis-style"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const open = state.hasTag("open")
  const dragging = state.matches("open.dragging")
  const resizing = state.matches("open.resizing")

  return {
    open: open,
    setOpen(nextOpen) {
      if (nextOpen === open) return
      send(nextOpen ? "OPEN" : "CLOSE")
    },
    dragging: dragging,
    resizing: resizing,

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        type: "button",
        disabled: state.context.disabled,
        id: dom.getTriggerId(state.context),
        "data-state": open ? "open" : "closed",
        "data-dragging": dataAttr(dragging),
        "aria-controls": dom.getContentId(state.context),
        onClick(event) {
          if (event.defaultPrevented) return
          if (state.context.disabled) return
          send({ type: "OPEN" })
        },
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        id: dom.getPositionerId(state.context),
        style: {
          position: "absolute",
          top: "var(--y)",
          left: "var(--x)",
        },
      })
    },

    getContentProps() {
      return normalize.element({
        ...parts.content.attrs,
        role: "dialog",
        tabIndex: 0,
        hidden: !open,
        id: dom.getContentId(state.context),
        "aria-labelledby": dom.getTitleId(state.context),
        "data-state": open ? "open" : "closed",
        "data-dragging": dataAttr(dragging),
        "data-topmost": dataAttr(state.context.isTopmost),
        "data-behind": dataAttr(!state.context.isTopmost),
        style: {
          position: state.context.strategy,
          width: "var(--width)",
          height: "var(--height)",
          overflow: state.context.isMinimized ? "hidden" : undefined,
        },
        onFocus() {
          send({ type: "WINDOW_FOCUS" })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!isSelfTarget(event)) return

          const step = getEventStep(event) * state.context.gridSize
          const keyMap: EventKeyMap = {
            Escape() {
              if (!state.context.isTopmost) return
              send("ESCAPE")
            },
            ArrowLeft() {
              send({ type: "MOVE", direction: "left", step })
            },
            ArrowRight() {
              send({ type: "MOVE", direction: "right", step })
            },
            ArrowUp() {
              send({ type: "MOVE", direction: "up", step })
            },
            ArrowDown() {
              send({ type: "MOVE", direction: "down", step })
            },
          }

          const handler = keyMap[getEventKey(event, state.context)]

          if (handler) {
            event.preventDefault()
            handler(event)
          }
        },
      })
    },

    getCloseTriggerProps() {
      return normalize.button({
        ...parts.closeTrigger.attrs,
        disabled: state.context.disabled,
        "aria-label": "Close Window",
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          send("CLOSE")
        },
      })
    },

    getMinimizeTriggerProps() {
      return normalize.button({
        ...parts.minimizeTrigger.attrs,
        disabled: state.context.disabled,
        "aria-label": "Minimize Window",
        hidden: state.context.isStaged,
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          send("MINIMIZE")
        },
      })
    },

    getMaximizeTriggerProps() {
      return normalize.button({
        ...parts.maximizeTrigger.attrs,
        disabled: state.context.disabled,
        "aria-label": "Maximize Window",
        hidden: state.context.isStaged,
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          send("MAXIMIZE")
        },
      })
    },

    getRestoreTriggerProps() {
      return normalize.button({
        ...parts.restoreTrigger.attrs,
        disabled: state.context.disabled,
        "aria-label": "Restore Window",
        hidden: !state.context.isStaged,
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          send("RESTORE")
        },
      })
    },

    getResizeTriggerProps(props: ResizeTriggerProps) {
      return normalize.element({
        ...parts.resizeTrigger.attrs,
        "data-disabled": dataAttr(!state.context.canResize),
        "data-axis": props.axis,
        onPointerDown(event) {
          if (!state.context.canResize || event.button == 2) return

          event.currentTarget.setPointerCapture(event.pointerId)
          event.stopPropagation()

          send({
            type: "RESIZE_START",
            axis: props.axis,
            position: { x: event.clientX, y: event.clientY },
          })
        },
        onPointerUp(event) {
          if (!state.context.canResize) return
          const node = event.currentTarget
          if (node.hasPointerCapture(event.pointerId)) {
            node.releasePointerCapture(event.pointerId)
          }
        },
        style: {
          position: "absolute",
          touchAction: "none",
          ...getResizeAxisStyle(props.axis),
        },
      })
    },

    getDragTriggerProps() {
      return normalize.element({
        ...parts.dragTrigger.attrs,
        "data-disabled": dataAttr(!state.context.canDrag),
        onPointerDown(event) {
          if (!state.context.canDrag || event.button == 2) return

          const target = getEventTarget<HTMLElement>(event)
          if (target?.closest("button") || target?.closest("[data-no-drag]")) {
            return
          }

          event.currentTarget.setPointerCapture(event.pointerId)
          event.stopPropagation()

          send({
            type: "DRAG_START",
            pointerId: event.pointerId,
            position: { x: event.clientX, y: event.clientY },
          })
        },
        onPointerUp(event) {
          if (!state.context.canDrag) return
          const node = event.currentTarget
          if (node.hasPointerCapture(event.pointerId)) {
            node.releasePointerCapture(event.pointerId)
          }
        },
        onDoubleClick() {
          send(state.context.isMaximized ? "RESTORE" : "MAXIMIZE")
        },
        style: {
          WebkitUserSelect: "none",
          userSelect: "none",
          touchAction: "none",
          cursor: "move",
        },
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        id: dom.getTitleId(state.context),
      })
    },

    getHeaderProps() {
      return normalize.element({
        ...parts.header.attrs,
        id: dom.getHeaderId(state.context),
        "data-dragging": dataAttr(dragging),
        "data-topmost": dataAttr(state.context.isTopmost),
        "data-behind": dataAttr(!state.context.isTopmost),
      })
    },

    getBodyProps() {
      return normalize.element({
        ...parts.body.attrs,
        "data-dragging": dataAttr(dragging),
        hidden: state.context.isMinimized,
      })
    },
  }
}
