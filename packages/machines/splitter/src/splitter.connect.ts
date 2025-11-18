import { dataAttr, getEventKey, getEventPoint, isLeftClick } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { ensure } from "@zag-js/utils"
import { parts } from "./splitter.anatomy"
import * as dom from "./splitter.dom"
import type { ResizeTriggerProps, ResizeTriggerState, SplitterApi, SplitterService } from "./splitter.types"
import { getAriaValue } from "./utils/aria"
import { fuzzyCompareNumbers, fuzzyNumbersEqual } from "./utils/fuzzy"
import { findPanelIndex, getPanelById, getPanelFlexBoxStyle, getPanelLayout, panelDataHelper } from "./utils/panel"

export function connect<T extends PropTypes>(service: SplitterService, normalize: NormalizeProps<T>): SplitterApi<T> {
  const { state, send, prop, computed, context, scope } = service

  const horizontal = computed("horizontal")
  const dragging = state.matches("dragging")

  const orientation = prop("orientation")

  const getPanelStyle = (id: string) => {
    const panels = prop("panels")
    const panelIndex = panels.findIndex((panel) => panel.id === id)
    const defaultSize = context.initial("size")[panelIndex]
    const dragState = context.get("dragState")
    return getPanelFlexBoxStyle({
      defaultSize,
      dragState,
      sizes: context.get("size"),
      panels: panels,
      panelIndex,
    })
  }

  const getResizeTriggerState = (props: ResizeTriggerProps): ResizeTriggerState => {
    const { id, disabled } = props
    const dragging = context.get("dragState")?.resizeTriggerId === id
    const focused = dragging || context.get("keyboardState")?.resizeTriggerId === id
    return {
      dragging,
      focused,
      disabled: !!disabled,
    }
  }

  return {
    dragging,
    orientation,
    getItems() {
      return prop("panels").flatMap((panel, index, arr) => {
        const nextPanel = arr[index + 1]
        if (panel && nextPanel) {
          return [
            { type: "panel", id: panel.id },
            { type: "handle", id: `${panel.id}:${nextPanel.id}` },
          ]
        }
        return [{ type: "panel", id: panel.id }]
      })
    },
    getSizes() {
      return context.get("size")
    },
    setSizes(size) {
      send({ type: "SIZE.SET", size })
    },
    resetSizes() {
      send({ type: "SIZE.SET", size: context.initial("size") })
    },
    collapsePanel(id) {
      send({ type: "PANEL.COLLAPSE", id })
    },
    expandPanel(id, minSize) {
      send({ type: "PANEL.EXPAND", id, minSize })
    },
    resizePanel(id, unsafePanelSize) {
      send({ type: "PANEL.RESIZE", id, size: unsafePanelSize })
    },
    getPanelSize(id) {
      const panels = prop("panels")
      const size = context.get("size")
      const panelData = getPanelById(panels, id)

      const { panelSize } = panelDataHelper(panels, panelData, size)
      ensure(panelSize, () => `Panel size not found for panel "${panelData.id}"`)

      return panelSize
    },
    isPanelCollapsed(id) {
      const panels = prop("panels")
      const size = context.get("size")
      const panelData = getPanelById(panels, id)

      const { collapsedSize = 0, collapsible, panelSize } = panelDataHelper(panels, panelData, size)
      ensure(panelSize, () => `Panel size not found for panel "${panelData.id}"`)
      return collapsible === true && fuzzyNumbersEqual(panelSize, collapsedSize)
    },
    isPanelExpanded(id) {
      const panels = prop("panels")
      const size = context.get("size")
      const panelData = getPanelById(panels, id)

      const { collapsedSize = 0, collapsible, panelSize } = panelDataHelper(panels, panelData, size)
      ensure(panelSize, () => `Panel size not found for panel "${panelData.id}"`)

      return !collapsible || fuzzyCompareNumbers(panelSize, collapsedSize) > 0
    },
    getLayout() {
      return getPanelLayout(prop("panels"))
    },

    getRootProps() {
      return normalize.element({
        ...parts.root.attrs,
        "data-orientation": orientation,
        "data-dragging": dataAttr(dragging),
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
        "data-orientation": orientation,
        "data-dragging": dataAttr(dragging),
        dir: prop("dir"),
        "data-id": id,
        "data-index": findPanelIndex(prop("panels"), id),
        id: dom.getPanelId(scope, id),
        "data-ownedby": dom.getRootId(scope),
        style: getPanelStyle(id),
      })
    },

    getResizeTriggerState,

    getResizeTriggerIndicator(props) {
      const triggerState = getResizeTriggerState(props)
      return normalize.element({
        ...parts.resizeTriggerIndicator.attrs,
        "data-orientation": orientation,
        "data-focus": dataAttr(triggerState.focused),
        "data-dragging": dataAttr(triggerState.dragging),
        "data-disabled": dataAttr(triggerState.disabled),
        "data-ownedby": dom.getRootId(scope),
      })
    },

    getResizeTriggerProps(props) {
      const { id } = props
      const triggerState = getResizeTriggerState(props)
      const aria = getAriaValue(context.get("size"), prop("panels"), id)

      return normalize.element({
        ...parts.resizeTrigger.attrs,
        dir: prop("dir"),
        id: dom.getResizeTriggerId(scope, id),
        role: "separator",
        "data-id": id,
        "data-ownedby": dom.getRootId(scope),
        tabIndex: triggerState.disabled ? undefined : 0,
        "aria-valuenow": aria.valueNow,
        "aria-valuemin": aria.valueMin,
        "aria-valuemax": aria.valueMax,
        "data-orientation": orientation,
        "aria-orientation": orientation,
        "aria-controls": `${dom.getPanelId(scope, aria.beforeId)} ${dom.getPanelId(scope, aria.afterId)}`,
        "data-focus": dataAttr(triggerState.focused),
        "data-dragging": dataAttr(triggerState.dragging),
        "data-disabled": dataAttr(triggerState.disabled),
        style: {
          touchAction: "none",
          userSelect: "none",
          WebkitUserSelect: "none",
          flex: "0 0 auto",
          pointerEvents: triggerState.disabled
            ? "none"
            : triggerState.dragging && !triggerState.focused
              ? "none"
              : undefined,
          cursor: triggerState.disabled ? undefined : horizontal ? "col-resize" : "row-resize",
          [horizontal ? "minHeight" : "minWidth"]: "0",
        },
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          if (triggerState.disabled) {
            event.preventDefault()
            return
          }
          const point = getEventPoint(event)
          send({ type: "POINTER_DOWN", id, point })
          event.currentTarget.setPointerCapture(event.pointerId)

          event.preventDefault()
          event.stopPropagation()
        },
        onPointerUp(event) {
          if (triggerState.disabled) return
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId)
          }
        },
        onPointerOver() {
          if (triggerState.disabled) return
          send({ type: "POINTER_OVER", id })
        },
        onPointerLeave() {
          if (triggerState.disabled) return
          send({ type: "POINTER_LEAVE", id })
        },
        onBlur() {
          if (triggerState.disabled) return
          send({ type: "BLUR" })
        },
        onFocus() {
          if (triggerState.disabled) return
          send({ type: "FOCUS", id })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return
          if (triggerState.disabled) return

          const keyboardResizeBy = prop("keyboardResizeBy")

          let delta = 0
          if (event.shiftKey) {
            delta = 10
          } else if (keyboardResizeBy != null) {
            delta = keyboardResizeBy
          } else {
            delta = 1
          }

          const keyMap: EventKeyMap = {
            Enter() {
              send({ type: "ENTER", id })
            },
            ArrowUp() {
              send({ type: "KEYBOARD_MOVE", id, delta: horizontal ? 0 : -delta })
            },
            ArrowDown() {
              send({ type: "KEYBOARD_MOVE", id, delta: horizontal ? 0 : delta })
            },
            ArrowLeft() {
              send({ type: "KEYBOARD_MOVE", id, delta: horizontal ? -delta : 0 })
            },
            ArrowRight() {
              send({ type: "KEYBOARD_MOVE", id, delta: horizontal ? delta : 0 })
            },
            Home() {
              send({ type: "KEYBOARD_MOVE", id, delta: -100 })
            },
            End() {
              send({ type: "KEYBOARD_MOVE", id, delta: 100 })
            },
            F6() {
              send({ type: "FOCUS.CYCLE", id, shiftKey: event.shiftKey })
            },
          }

          const key = getEventKey(event, {
            dir: prop("dir"),
            orientation: orientation,
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
