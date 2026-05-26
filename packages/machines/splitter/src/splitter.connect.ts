import { dataAttr, getEventKey, getEventPoint, isLeftClick } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { ensure } from "@zag-js/utils"
import { parts } from "./splitter.anatomy"
import * as dom from "./splitter.dom"
import type { ResizeTriggerProps, ResizeTriggerState, SplitterApi, SplitterService } from "./splitter.types"
import { getAriaValue } from "./utils/aria"
import { fuzzyCompareNumbers, fuzzyNumbersEqual } from "./utils/fuzzy"
import { findPanelIndex, getPanelById, getPanelFlexBoxStyle, getPanelLayout, panelDataHelper } from "./utils/panel"
import { resolvePanelSizes } from "./utils/size"

export function connect<T extends PropTypes>(service: SplitterService, normalize: NormalizeProps<T>): SplitterApi<T> {
  const { state, send, prop, computed, context, scope } = service

  const horizontal = computed("horizontal")
  const dragging = state.matches("dragging")
  const registry = prop("registry")

  const orientation = prop("orientation")
  const rawPanels = prop("panels")
  const panels = context.get("panels")

  const getResolvedSizes = () => {
    const sizes = context.get("size")
    if (sizes.length > 0) return sizes
    return resolvePanelSizes({
      sizes: prop("size") ?? prop("defaultSize"),
      panels: rawPanels,
      rootEl: null,
      orientation,
    })
  }

  const getPanelStyle = (id: string) => {
    const panelIndex = rawPanels.findIndex((panel) => panel.id === id)
    const size = prop("size")?.[panelIndex]
    const defaultSize = prop("defaultSize")?.[panelIndex]
    const dragState = context.get("dragState")
    return getPanelFlexBoxStyle({
      size,
      defaultSize,
      dragState,
      resolvedSizes: context.get("size"),
      panels: rawPanels,
      panelIndex,
      horizontal,
    })
  }

  const resolveResizeTriggerId = (id: string) => {
    const [beforeId, afterId] = id.split(":")
    if (beforeId && afterId) return id

    if (beforeId) {
      const index = rawPanels.findIndex((panel) => panel.id === beforeId)
      const nextPanel = rawPanels[index + 1]
      return nextPanel ? `${beforeId}:${nextPanel.id}` : id
    }

    if (afterId) {
      const index = rawPanels.findIndex((panel) => panel.id === afterId)
      const prevPanel = rawPanels[index - 1]
      return prevPanel ? `${prevPanel.id}:${afterId}` : id
    }

    return id
  }

  const getResizeTriggerState = (props: ResizeTriggerProps): ResizeTriggerState => {
    const { id, disabled } = props
    const dragging = context.get("dragState")?.resizeTriggerId === id
    const focused = dragging || (state.matches("focused") && context.get("keyboardState")?.resizeTriggerId === id)
    return {
      dragging,
      focused,
      disabled: !!disabled,
    }
  }

  return {
    dragging,
    orientation,
    getPanels() {
      return rawPanels
    },
    getPanelById(id) {
      return getPanelById(rawPanels, id)
    },
    getItems() {
      return rawPanels.flatMap((panel, index, arr) => {
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
      return getResolvedSizes()
    },
    setSizes(size) {
      send({ type: "SIZE.SET", size })
    },
    resetSizes() {
      send({ type: "SIZE.RESET" })
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
      const panels = context.get("panels")
      const size = getResolvedSizes()
      const panelData = getPanelById(panels, id)

      const { panelSize } = panelDataHelper(panels, panelData, size)
      ensure(panelSize != null, () => `Panel size not found for panel "${panelData.id}"`)

      return panelSize
    },
    isPanelCollapsed(id) {
      const panels = context.get("panels")
      const size = getResolvedSizes()
      const panelData = getPanelById(panels, id)

      const { collapsedSize = 0, collapsible, panelSize } = panelDataHelper(panels, panelData, size)
      ensure(panelSize != null, () => `Panel size not found for panel "${panelData.id}"`)
      return collapsible === true && fuzzyNumbersEqual(panelSize, collapsedSize)
    },
    isPanelExpanded(id) {
      const panels = context.get("panels")
      const size = getResolvedSizes()
      const panelData = getPanelById(panels, id)

      const { collapsedSize = 0, collapsible, panelSize } = panelDataHelper(panels, panelData, size)
      ensure(panelSize != null, () => `Panel size not found for panel "${panelData.id}"`)

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
      const resolvedId = resolveResizeTriggerId(id)
      const aria = getAriaValue(getResolvedSizes(), panels, resolvedId)

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
        "aria-controls":
          aria.beforeId && aria.afterId
            ? `${dom.getPanelId(scope, aria.beforeId)} ${dom.getPanelId(scope, aria.afterId)}`
            : undefined,
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
          cursor: triggerState.disabled || registry ? undefined : horizontal ? "col-resize" : "row-resize",
          [horizontal ? "minHeight" : "minWidth"]: "0",
        },
        onPointerDown(event) {
          if (!isLeftClick(event)) return
          if (triggerState.disabled) {
            event.preventDefault()
            return
          }

          // Safari doesn't move focus to non-form elements on pointer down,
          // so focus explicitly to enable keyboard resizing after clicking.
          event.currentTarget.focus({ preventScroll: true })

          // If registry is enabled, it handles pointer events
          if (registry) {
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
          if (triggerState.disabled || registry) return
          send({ type: "POINTER_OVER", id })
        },
        onPointerLeave() {
          if (triggerState.disabled || registry) return
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
