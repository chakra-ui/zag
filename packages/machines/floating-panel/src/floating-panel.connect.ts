import { getEventKey, getNativeEvent, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr, getEventTarget } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./floating-panel.anatomy"
import { dom } from "./floating-panel.dom"
import type { DockProps, ResizeTriggerProps, Send, State } from "./floating-panel.types"
import { getResizeAxisStyle } from "./utils/get-resize-axis-style"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isOpen = state.hasTag("open")
  const isDragging = state.matches("open.dragging")
  const isResizing = state.matches("open.resizing")

  const isMaximized = state.context.stage === "maximized"
  const isMinimized = state.context.stage === "minimized"

  return {
    isOpen,
    isDragging,
    isResizing,

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      type: "button",
      id: dom.getTriggerId(state.context),
      "data-state": isOpen ? "open" : "closed",
      "aria-controls": dom.getContentId(state.context),
      onClick() {
        send({ type: "OPEN" })
      },
    }),

    positionerProps: normalize.element({
      ...parts.positioner.attrs,
      id: dom.getPositionerId(state.context),
      style: {
        position: "absolute",
        top: "var(--y)",
        left: "var(--x)",
      },
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      role: "dialog",
      tabIndex: 0,
      hidden: !isOpen,
      "data-state": isOpen ? "open" : "closed",
      id: dom.getContentId(state.context),
      "aria-labelledby": dom.getTitleId(state.context),
      "data-dragging": dataAttr(isDragging),
      style: {
        position: "relative",
        width: "var(--width)",
        height: "var(--height)",
      },
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
          Escape() {
            send("ESCAPE")
          },
          ArrowLeft() {},
          ArrowRight() {},
          ArrowUp() {},
          ArrowDown() {},
        }

        const handler = keyMap[getEventKey(event, state.context)]

        if (handler) {
          event.preventDefault()
          handler(event)
        }
      },
    }),

    closeTriggerProps: normalize.button({
      ...parts.closeTrigger.attrs,
      disabled: state.context.disabled,
      "aria-label": "Close Window",
      type: "button",
      onClick() {
        send("CLOSE")
      },
    }),

    minimizeTriggerProps: normalize.button({
      ...parts.minimizeTrigger.attrs,
      disabled: state.context.disabled,
      "aria-label": "Minimize Window",
      hidden: isMinimized || isMaximized,
      type: "button",
      onClick() {
        send("MINIMIZE")
      },
    }),

    maximizeTriggerProps: normalize.button({
      ...parts.maximizeTrigger.attrs,
      disabled: state.context.disabled,
      "aria-label": "Maximize Window",
      hidden: isMaximized || isMinimized,
      type: "button",
      onClick() {
        send("MAXIMIZE")
      },
    }),

    restoreTriggerProps: normalize.button({
      ...parts.restoreTrigger.attrs,
      disabled: state.context.disabled,
      "aria-label": "Restore Window",
      hidden: !(isMaximized || isMinimized),
      type: "button",
      onClick() {
        send("RESTORE")
      },
    }),

    getResizeTriggerProps(props: ResizeTriggerProps) {
      const disabled = !state.context.resizable || state.context.disabled
      return normalize.element({
        ...parts.resizeTrigger.attrs,
        disabled,
        "data-disabled": dataAttr(disabled),
        "data-axis": props.axis,
        onPointerDown(event) {
          if (disabled || event.button == 2) return
          event.currentTarget.setPointerCapture(event.pointerId)

          event.stopPropagation()

          send({
            type: "RESIZE_START",
            axis: props.axis,
            position: { x: event.clientX, y: event.clientY },
          })
        },
        style: {
          position: "absolute",
          touchAction: "none",
          ...getResizeAxisStyle(props.axis),
        },
      })
    },

    dragTriggerProps: normalize.element({
      ...parts.dragTrigger.attrs,
      disabled: state.context.draggable || state.context.disabled,
      onPointerDown(event) {
        if (!state.context.draggable || state.context.disabled || event.button == 2) return

        const target = getEventTarget<HTMLElement>(getNativeEvent(event))

        if (target?.closest("button")) {
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
      onDoubleClick() {
        send("MAXIMIZE")
      },
      style: {
        userSelect: "none",
        touchAction: "none",
        cursor: "move",
      },
    }),

    getDockProps(props: DockProps) {
      const isIntersecting = true
      return normalize.element({
        ...parts.dock.attrs,
        "data-ownedby": state.context.id,
        "data-dock": props.id,
        "data-intersecting": dataAttr(isIntersecting),
      })
    },

    titleProps: normalize.element({
      ...parts.title.attrs,
      id: dom.getTitleId(state.context),
    }),

    headerProps: normalize.element({
      ...parts.header.attrs,
      "data-dragging": dataAttr(isDragging),
    }),

    bodyProps: normalize.element({
      ...parts.body.attrs,
      "data-dragging": dataAttr(isDragging),
      hidden: isMinimized,
    }),
  }
}
