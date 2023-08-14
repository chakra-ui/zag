import { getEventKey, getEventStep, type EventKeyMap } from "@zag-js/dom-event"
import { dataAttr } from "@zag-js/dom-query"
import type { NormalizeProps, PropTypes } from "@zag-js/types"
import { parts } from "./splitter.anatomy"
import { dom } from "./splitter.dom"
import type { PanelId, PanelProps, MachineApi, ResizeTriggerProps, Send, State } from "./splitter.types"
import { getHandleBounds } from "./splitter.utils"

export function connect<T extends PropTypes>(state: State, send: Send, normalize: NormalizeProps<T>): MachineApi<T> {
  const isHorizontal = state.context.isHorizontal
  const isFocused = state.hasTag("focus")
  const isDragging = state.matches("dragging")
  const panels = state.context.panels

  const api = {
    isFocused,
    isDragging,
    bounds: getHandleBounds(state.context),

    setToMinSize(id: PanelId) {
      const panel = panels.find((panel) => panel.id === id)
      send({ type: "SET_PANEL_SIZE", id, size: panel?.minSize, src: "setToMinSize" })
    },

    setToMaxSize(id: PanelId) {
      const panel = panels.find((panel) => panel.id === id)
      send({ type: "SET_PANEL_SIZE", id, size: panel?.maxSize, src: "setToMaxSize" })
    },

    setSize(id: PanelId, size: number) {
      send({ type: "SET_PANEL_SIZE", id, size })
    },

    getResizeTriggerState(props: ResizeTriggerProps) {
      const { id, disabled } = props
      const ids = id.split(":")
      const panelIds = ids.map((id) => dom.getPanelId(state.context, id))
      const panels = getHandleBounds(state.context, id)

      return {
        isDisabled: !!disabled,
        isFocused: state.context.activeResizeId === id && isFocused,
        panelIds,
        min: panels?.min,
        max: panels?.max,
        value: 0,
      }
    },

    rootProps: normalize.element({
      ...parts.root.attrs,
      "data-orientation": state.context.orientation,
      id: dom.getRootId(state.context),
      dir: state.context.dir,
      style: {
        display: "flex",
        flexDirection: isHorizontal ? "row" : "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      },
    }),

    getPanelProps(props: PanelProps) {
      const { id } = props
      return normalize.element({
        ...parts.panel.attrs,
        dir: state.context.dir,
        id: dom.getPanelId(state.context, id),
        "data-ownedby": dom.getRootId(state.context),
        style: dom.getPanelStyle(state.context, id),
      })
    },

    getResizeTriggerProps(props: ResizeTriggerProps) {
      const { id, disabled, step = 1 } = props
      const triggerState = api.getResizeTriggerState(props)

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
        "data-focus": dataAttr(triggerState.isFocused),
        "data-disabled": dataAttr(disabled),
        style: {
          touchAction: "none",
          userSelect: "none",
          flex: "0 0 auto",
          pointerEvents: isDragging && !triggerState.isFocused ? "none" : undefined,
          cursor: isHorizontal ? "col-resize" : "row-resize",
          [isHorizontal ? "minHeight" : "minWidth"]: "0",
        },
        onPointerDown(event) {
          if (disabled) {
            event.preventDefault()
            return
          }
          send({ type: "POINTER_DOWN", id })
          event.preventDefault()
          event.stopPropagation()
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

  return api
}
