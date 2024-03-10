import { dataAttr } from "@zag-js/dom-query"
import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./floating-panel.anatomy"
import { dom } from "./floating-panel.dom"
import type { DockProps, ResizeTriggerProps, Send, State } from "./floating-panel.types"
import { getResizeAxisStyle } from "./utils/get-resize-axis-style"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>) {
  const isOpen = state.hasTag("open")
  const isDragging = state.matches("open.dragging")
  const isResizing = state.matches("open.resizing")

  return {
    isOpen,
    isDragging,
    isResizing,

    trigger: normalize.button({
      ...parts.trigger.attrs,
      type: "button",
      id: dom.getTriggerId(state.context),
    }),

    positionerProps: normalize.element({
      ...parts.positioner.attrs,
      id: dom.getPositionerId(state.context),
    }),

    contentProps: normalize.element({
      ...parts.content.attrs,
      role: "dialog",
      tabIndex: 0,
      id: dom.getContentId(state.context),
      style: {
        position: "relative",
      },
      onKeyDown(event) {
        const keyMap: EventKeyMap = {
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
      type: "button",
      onClick() {
        send("CLOSE")
      },
    }),

    getResizeTriggerProps(props: ResizeTriggerProps) {
      const disabled = state.context.resizable || state.context.disabled
      return normalize.button({
        ...parts.resizeTrigger.attrs,
        disabled,
        "data-disabled": dataAttr(disabled),
        "data-axis": props.axis,
        type: "button",
        onPointerDown(event) {
          if (disabled) return
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

    dragTriggerProps: normalize.button({
      ...parts.dragTrigger.attrs,
      disabled: state.context.draggable || state.context.disabled,
      type: "button",
      onPointerDown(event) {
        if (state.context.disabled) return
        send({
          type: "DRAG_START",
          position: { x: event.clientX, y: event.clientY },
        })
      },
    }),

    getDockProps(props: DockProps) {
      const isIntersecting = true
      return normalize.element({
        ...parts.dock.attrs,
        "data-uid": props.id,
        "data-intersecting": dataAttr(isIntersecting),
      })
    },
  }
}
