import { dataAttr, getEventKey, getEventStep, getEventTarget, isSelfTarget } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./floating-panel.anatomy"
import * as dom from "./floating-panel.dom"
import type { FloatingPanelService, FloatingPanelApi, ResizeTriggerProps } from "./floating-panel.types"
import { getResizeAxisStyle } from "./get-resize-axis-style"
import { match, toPx } from "@zag-js/utils"

const validStages = new Set(["minimized", "maximized", "default"])

export function connect<T extends PropTypes>(
  service: FloatingPanelService,
  normalize: NormalizeProps<T>,
): FloatingPanelApi<T> {
  const { state, send, scope, prop, computed, context } = service

  const open = state.hasTag("open")

  const dragging = state.matches("open.dragging")
  const resizing = state.matches("open.resizing")

  const isTopmost = context.get("isTopmost")
  const size = context.get("size")
  const position = context.get("position")

  const isMaximized = computed("isMaximized")
  const isMinimized = computed("isMinimized")
  const isStaged = computed("isStaged")
  const canResize = computed("canResize")
  const canDrag = computed("canDrag")

  return {
    open,
    resizable: prop("resizable"),
    draggable: prop("draggable"),
    setOpen(nextOpen) {
      const open = state.hasTag("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
    },
    dragging,
    resizing,
    position,
    size,
    setPosition(position) {
      send({ type: "SET_POSITION", position })
    },
    setSize(size) {
      send({ type: "SET_SIZE", size })
    },
    minimize() {
      send({ type: "MINIMIZE" })
    },
    maximize() {
      send({ type: "MAXIMIZE" })
    },
    restore() {
      send({ type: "RESTORE" })
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        type: "button",
        disabled: prop("disabled"),
        id: dom.getTriggerId(scope),
        "data-state": open ? "open" : "closed",
        "data-dragging": dataAttr(dragging),
        "aria-controls": dom.getContentId(scope),
        onClick(event) {
          if (event.defaultPrevented) return
          if (prop("disabled")) return
          send({ type: "OPEN" })
        },
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        id: dom.getPositionerId(scope),
        style: {
          "--width": toPx(size?.width),
          "--height": toPx(size?.height),
          "--x": toPx(position?.x),
          "--y": toPx(position?.y),
          position: prop("strategy"),
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
        id: dom.getContentId(scope),
        "aria-labelledby": dom.getTitleId(scope),
        "data-state": open ? "open" : "closed",
        "data-dragging": dataAttr(dragging),
        "data-topmost": dataAttr(isTopmost),
        "data-behind": dataAttr(!isTopmost),
        style: {
          width: "var(--width)",
          height: "var(--height)",
          overflow: isMinimized ? "hidden" : undefined,
        },
        onFocus() {
          send({ type: "CONTENT_FOCUS" })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (!isSelfTarget(event)) return

          const step = getEventStep(event) * prop("gridSize")
          const keyMap: EventKeyMap = {
            Escape() {
              if (!isTopmost) return
              send({ type: "ESCAPE" })
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

          const handler = keyMap[getEventKey(event, { dir: prop("dir") })]

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
        disabled: prop("disabled"),
        "aria-label": "Close Window",
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "CLOSE" })
        },
      })
    },

    getStageTriggerProps(props) {
      if (!validStages.has(props.stage)) {
        throw new Error(`[zag-js] Invalid stage: ${props.stage}. Must be one of: ${Array.from(validStages).join(", ")}`)
      }

      const translations = prop("translations")

      const actionProps = match(props.stage, {
        minimized: () => ({
          "aria-label": translations.minimize,
          hidden: isStaged,
        }),
        maximized: () => ({
          "aria-label": translations.maximize,
          hidden: isStaged,
        }),
        default: () => ({
          "aria-label": translations.restore,
          hidden: !isStaged,
        }),
      })

      return normalize.button({
        ...parts.stageTrigger.attrs,
        disabled: prop("disabled"),
        ...actionProps,
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          const type = match(props.stage, {
            minimized: () => "MINIMIZE",
            maximized: () => "MAXIMIZE",
            default: () => "RESTORE",
          })
          send({ type: type.toUpperCase() })
        },
      })
    },

    getResizeTriggerProps(props: ResizeTriggerProps) {
      return normalize.element({
        ...parts.resizeTrigger.attrs,
        "data-disabled": dataAttr(!canResize),
        "data-axis": props.axis,
        onPointerDown(event) {
          if (!canResize || event.button == 2) return

          event.currentTarget.setPointerCapture(event.pointerId)
          event.stopPropagation()

          send({
            type: "RESIZE_START",
            axis: props.axis,
            position: { x: event.clientX, y: event.clientY },
          })
        },
        onPointerUp(event) {
          if (!canResize) return
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
        "data-disabled": dataAttr(!canDrag),
        onPointerDown(event) {
          if (!canDrag || event.button == 2) return

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
          if (!canDrag) return
          const node = event.currentTarget
          if (node.hasPointerCapture(event.pointerId)) {
            node.releasePointerCapture(event.pointerId)
          }
        },
        onDoubleClick() {
          send({ type: isMaximized ? "RESTORE" : "MAXIMIZE" })
        },
        style: {
          WebkitUserSelect: "none",
          userSelect: "none",
          touchAction: "none",
          cursor: "move",
        },
      })
    },

    getControlProps() {
      return normalize.element({
        ...parts.control.attrs,
        "data-disabled": dataAttr(prop("disabled")),
        "data-stage": context.get("stage"),
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        id: dom.getTitleId(scope),
      })
    },

    getHeaderProps() {
      return normalize.element({
        ...parts.header.attrs,
        id: dom.getHeaderId(scope),
        "data-dragging": dataAttr(dragging),
        "data-topmost": dataAttr(isTopmost),
        "data-behind": dataAttr(!isTopmost),
      })
    },

    getBodyProps() {
      return normalize.element({
        ...parts.body.attrs,
        "data-dragging": dataAttr(dragging),
        hidden: isMinimized,
      })
    },
  }
}
