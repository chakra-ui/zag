import { dataAttr, getEventKey, getEventStep } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { ensure } from "@zag-js/utils"
import { parts } from "./splitter.anatomy"
import * as dom from "./splitter.dom"
import type { ResizeTriggerProps, ResizeTriggerState, SplitterApi, SplitterService } from "./splitter.types"
import { getHandleBounds } from "./splitter.utils"

export function connect<T extends PropTypes>(service: SplitterService, normalize: NormalizeProps<T>): SplitterApi<T> {
  const { state, send, prop, computed, context, scope } = service

  const horizontal = computed("isHorizontal")
  const focused = state.hasTag("focus")
  const dragging = state.matches("dragging")
  const panels = computed("panels")
  const activeResizeId = context.get("activeResizeId")

  function getResizeTriggerState(props: ResizeTriggerProps): ResizeTriggerState {
    const { id, disabled } = props
    const ids = id.split(":")
    const panelIds = ids.map((id) => dom.getPanelId(scope, id))
    const panels = getHandleBounds(computed("panels"), id)

    return {
      disabled: !!disabled,
      focused: activeResizeId === id && focused,
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
    bounds: getHandleBounds(computed("panels"), activeResizeId),
    setToMinSize(id) {
      const panel = panels.find((panel) => panel.id === id)
      send({ type: "SIZE.SET", id, size: panel?.minSize, src: "setToMinSize" })
    },
    setToMaxSize(id) {
      const panel = panels.find((panel) => panel.id === id)
      send({ type: "SIZE.SET", id, size: panel?.maxSize, src: "setToMaxSize" })
    },
    setSize(id, size) {
      send({ type: "SIZE.SET", id, size })
    },
    setSizes(sizes) {
      send({ type: "SIZES.SET", sizes })
    },
    getSize(id) {
      const panel = panels.find((panel) => panel.id === id)
      ensure(panel, `Panel with id ${id} not found`)
      return panel.size
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        "data-orientation": prop("orientation"),
        id: dom.getRootId(scope),
        dir: prop("dir"),
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
        "data-orientation": prop("orientation"),
        dir: prop("dir"),
        id: dom.getPanelId(scope, id),
        "data-ownedby": dom.getRootId(scope),
        style: dom.getPanelStyle(panels, id),
      })
    },

    getResizeTriggerProps(props) {
      const { id, disabled, step = 1 } = props
      const triggerState = getResizeTriggerState(props)

      return normalize.element({
        ...parts.resizeTrigger.attrs,
        dir: prop("dir"),
        id: dom.getResizeTriggerId(scope, id),
        role: "separator",
        "data-ownedby": dom.getRootId(scope),
        tabIndex: disabled ? undefined : 0,
        "aria-valuenow": triggerState.value,
        "aria-valuemin": triggerState.min,
        "aria-valuemax": triggerState.max,
        "data-orientation": prop("orientation"),
        "aria-orientation": prop("orientation"),
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
          send({ type: "BLUR" })
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
              send({ type: "ENTER" })
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
              send({ type: "HOME" })
            },
            End() {
              send({ type: "END" })
            },
          }

          const key = getEventKey(event, {
            dir: prop("dir"),
            orientation: prop("orientation"),
          })
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
