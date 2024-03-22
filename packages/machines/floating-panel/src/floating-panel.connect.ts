import { getEventKey, getEventStep, getNativeEvent, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr, getEventTarget, isSelfEvent } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./floating-panel.anatomy"
import { dom } from "./floating-panel.dom"
import type { MachineApi, ResizeTriggerProps, Send, State } from "./floating-panel.types"
import { getResizeAxisStyle } from "./get-resize-axis-style"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isOpen = state.hasTag("open")
  const isDragging = state.matches("open.dragging")
  const isResizing = state.matches("open.resizing")

  return {
    isOpen,
    isDragging,
    isResizing,

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      type: "button",
      disabled: state.context.isDisabled,
      id: dom.getTriggerId(state.context),
      "data-state": isOpen ? "open" : "closed",
      "data-dragging": dataAttr(isDragging),
      "aria-controls": dom.getContentId(state.context),
      onClick() {
        if (state.context.isDisabled) return
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
      id: dom.getContentId(state.context),
      "aria-labelledby": dom.getTitleId(state.context),
      "data-state": isOpen ? "open" : "closed",
      "data-dragging": dataAttr(isDragging),
      style: {
        position: "relative",
        width: "var(--width)",
        height: "var(--height)",
        overflow: state.context.isMinimized ? "hidden" : undefined,
      },
      onKeyDown(event) {
        if (!isSelfEvent(getNativeEvent(event))) return
        const step = getEventStep(event) * state.context.gridSize
        const keyMap: EventKeyMap = {
          Escape() {
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
    }),

    closeTriggerProps: normalize.button({
      ...parts.closeTrigger.attrs,
      disabled: state.context.isDisabled,
      "aria-label": "Close Window",
      type: "button",
      onClick() {
        send("CLOSE")
      },
    }),

    minimizeTriggerProps: normalize.button({
      ...parts.minimizeTrigger.attrs,
      disabled: state.context.isDisabled,
      "aria-label": "Minimize Window",
      hidden: state.context.isStaged,
      type: "button",
      onClick() {
        send("MINIMIZE")
      },
    }),

    maximizeTriggerProps: normalize.button({
      ...parts.maximizeTrigger.attrs,
      disabled: state.context.isDisabled,
      "aria-label": "Maximize Window",
      hidden: state.context.isStaged,
      type: "button",
      onClick() {
        send("MAXIMIZE")
      },
    }),

    restoreTriggerProps: normalize.button({
      ...parts.restoreTrigger.attrs,
      disabled: state.context.isDisabled,
      "aria-label": "Restore Window",
      hidden: !state.context.isStaged,
      type: "button",
      onClick() {
        send("RESTORE")
      },
    }),

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
        style: {
          position: "absolute",
          touchAction: "none",
          ...getResizeAxisStyle(props.axis),
        },
      })
    },

    dragTriggerProps: normalize.element({
      ...parts.dragTrigger.attrs,
      "data-disabled": dataAttr(!state.context.canDrag),
      onPointerDown(event) {
        if (!state.context.canDrag || event.button == 2) return

        const target = getEventTarget<HTMLElement>(getNativeEvent(event))

        if (target?.closest("button")) {
          console.log(target?.closest("button"))
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
        send(state.context.isMaximized ? "RESTORE" : "MAXIMIZE")
      },
      style: {
        userSelect: "none",
        touchAction: "none",
        cursor: "move",
      },
    }),

    titleProps: normalize.element({
      ...parts.title.attrs,
      id: dom.getTitleId(state.context),
    }),

    headerProps: normalize.element({
      ...parts.header.attrs,
      id: dom.getHeaderId(state.context),
      "data-dragging": dataAttr(isDragging),
    }),

    bodyProps: normalize.element({
      ...parts.body.attrs,
      "data-dragging": dataAttr(isDragging),
      hidden: state.context.isMinimized,
    }),
  }
}
