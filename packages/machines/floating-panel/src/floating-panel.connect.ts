import { getEventKey, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr } from "@zag-js/dom-query"
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

    triggerProps: normalize.button({
      ...parts.trigger.attrs,
      type: "button",
      id: dom.getTriggerId(state.context),
      onClick() {
        send({ type: "OPEN" })
      },
    }),

    positionerProps: normalize.element({
      ...parts.positioner.attrs,
      id: dom.getPositionerId(state.context),
      style: {
        position: "absolute",
        "--x": `${state.context.position.x}px`,
        "--y": `${state.context.position.y}px`,
        "--width": `${state.context.size.width}px`,
        "--height": `${state.context.size.height}px`,
        translate: `var(--x) var(--y)`,
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
      return normalize.element({
        ...parts.resizeTrigger.attrs,
        disabled,
        "data-disabled": dataAttr(disabled),
        "data-axis": props.axis,
        onPointerDown(event) {
          if (disabled) return
          event.preventDefault()
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
        if (state.context.disabled) return
        event.preventDefault()
        send({
          type: "DRAG_START",
          position: { x: event.clientX, y: event.clientY },
        })
      },
      style: {
        userSelect: "none",
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
    }),
  }
}
