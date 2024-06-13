import { getEventKey, getEventStep, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./splitter.anatomy"
import { dom } from "./splitter.dom"
import type { MachineApi, ResizeTriggerProps, ResizeTriggerState, Send, State } from "./splitter.types"
import { getHandleBounds } from "./splitter.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const horizontal = state.context.isHorizontal
  const focused = state.hasTag("focus")
  const dragging = state.matches("dragging")
  const panels = state.context.panels

  function getResizeTriggerState(props: ResizeTriggerProps): ResizeTriggerState {
    const { id, disabled } = props
    const ids = id.split(":")
    const panelIds = ids.map((id) => dom.getPanelId(state.context, id))
    const panels = getHandleBounds(state.context, id)

    return {
      disabled: !!disabled,
      focused: state.context.activeResizeId === id && focused,
      panelIds,
      min: panels?.min,
      max: panels?.max,
      value: 0,
    }
  }

  return {
    focused: focused,
    dragging: dragging,
    getResizeTriggerState,
    bounds: getHandleBounds(state.context),
    setToMinSize(id) {
      const panel = panels.find((panel) => panel.id === id)
      send({ type: "SET_PANEL_SIZE", id, size: panel?.minSize, src: "setToMinSize" })
    },
    setToMaxSize(id) {
      const panel = panels.find((panel) => panel.id === id)
      send({ type: "SET_PANEL_SIZE", id, size: panel?.maxSize, src: "setToMaxSize" })
    },
    setSize(id, size) {
      send({ type: "SET_PANEL_SIZE", id, size })
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        "data-orientation": state.context.orientation,
        id: dom.getRootId(state.context),
        dir: state.context.dir,
        style: {
          display: "flex",
          flexDirection: horizontal ? "row" : "column",
          height: "100%",
          width: "100%",
          overflow: "hidden",
        },
      })
    },

    getPanelProps(props) {
      const { id } = props
      return normalize.element({
        ...parts.panel.attrs,
        "data-orientation": state.context.orientation,
        dir: state.context.dir,
        id: dom.getPanelId(state.context, id),
        "data-ownedby": dom.getRootId(state.context),
        style: dom.getPanelStyle(state.context, id),
      })
    },

    getResizeTriggerProps(props) {
      const { id, disabled, step = 1 } = props
      const triggerState = getResizeTriggerState(props)

      return normalize.element({
        ...parts.resizeTrigger.attrs,
        dir: state.context.dir,
        id: dom.getResizeTriggerId(state.context, id),
        role: "separator",
        "data-ownedby": dom.getRootId(state.context),
        tabIndex: disabled ? undefined : 0,
        "aria-valuenow": triggerState.value,
        "aria-valuemin": triggerState.min,
        "aria-valuemax": triggerState.max,
        "data-orientation": state.context.orientation,
        "aria-orientation": state.context.orientation,
        "aria-controls": triggerState.panelIds.join(" "),
        "data-focus": dataAttr(triggerState.focused),
        "data-disabled": dataAttr(disabled),
        style: {
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          flex: "0 0 auto",
          pointerEvents: dragging && !triggerState.focused ? "none" : undefined,
          cursor: horizontal ? "col-resize" : "row-resize",
          [horizontal ? "minHeight" : "minWidth"]: "0",
        },
        onPointerDown(event) {
          if (disabled) {
            event.preventDefault()
            return
          }
          send({ type: "POINTER_DOWN", id })
          event.currentTarget.setPointerCapture(event.pointerId)
          event.preventDefault()
          event.stopPropagation()
        },
        onPointerUp(event) {
          if (disabled) return
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
        },
        onPointerOver() {
          if (disabled) return
          send({ type: "POINTER_OVER", id })
        },
        onPointerLeave() {
          if (disabled) return
          send({ type: "POINTER_LEAVE", id })
        },
        onBlur() {
          send("BLUR")
        },
        onFocus() {
          send({ type: "FOCUS", id })
        },
        onDoubleClick() {
          if (disabled) return
          send({ type: "DOUBLE_CLICK", id })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (disabled) return

          const moveStep = getEventStep(event) * step

          const keyMap: EventKeyMap = {
            Enter() {
              send("ENTER")
            },
            ArrowUp() {
              send({ type: "ARROW_UP", step: moveStep })
            },
            ArrowDown() {
              send({ type: "ARROW_DOWN", step: moveStep })
            },
            ArrowLeft() {
              send({ type: "ARROW_LEFT", step: moveStep })
            },
            ArrowRight() {
              send({ type: "ARROW_RIGHT", step: moveStep })
            },
            Home() {
              send("HOME")
            },
            End() {
              send("END")
            },
          }

          const key = getEventKey(event, state.context)
          const exec = keyMap[key]

          if (exec) {
            exec(event)
            event.preventDefault()
          }
        },
      })
    },
  }
}
