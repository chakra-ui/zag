import { dataAttr, getEventKey, getEventStep, getEventTarget, isLeftClick } from "@zag-js/dom-query"
import type { EventKeyMap, NormalizeProps, PropTypes } from "@zag-js/types"
import { match, toPx } from "@zag-js/utils"
import { parts } from "./floating-panel.anatomy"
import * as dom from "./floating-panel.dom"
import type {
  ContentState,
  ControlState,
  FloatingPanelApi,
  FloatingPanelService,
  ResizeTriggerProps,
  ResizeTriggerState,
  StageTriggerProps,
  StageTriggerState,
  TriggerState,
} from "./floating-panel.types"
import { getResizePlacementStyle } from "./get-resize-placement-style"

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

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getTriggerState(): TriggerState {
    return { open, dragging, disabled: !!prop("disabled") }
  }

  function getContentState(): ContentState {
    return { open, dragging, topmost: !!isTopmost, minimized: isMinimized, maximized: isMaximized, staged: isStaged }
  }

  function getControlState(): ControlState {
    return {
      disabled: !!prop("disabled"),
      stage: context.get("stage"),
      minimized: isMinimized,
      maximized: isMaximized,
      staged: isStaged,
    }
  }

  function getResizeTriggerState(props: ResizeTriggerProps): ResizeTriggerState {
    return { placement: props.placement, disabled: !canResize }
  }

  function getStageTriggerState(props: StageTriggerProps): StageTriggerState {
    if (!validStages.has(props.stage)) {
      throw new Error(`[zag-js] Invalid stage: ${props.stage}. Must be one of: ${Array.from(validStages).join(", ")}`)
    }
    const hidden = props.stage === "default" ? !isStaged : isStaged
    return { stage: props.stage, hidden }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

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

    getTriggerState,
    getTriggerProps() {
      const triggerState = getTriggerState()
      return normalize.button({
        ...parts.trigger.attrs(scope.id),
        dir: prop("dir"),
        type: "button",
        disabled: triggerState.disabled,
        "data-state": triggerState.open ? "open" : "closed",
        "data-dragging": dataAttr(triggerState.dragging),
        "aria-controls": dom.getContentId(scope),
        onClick(event) {
          if (event.defaultPrevented) return
          if (prop("disabled")) return
          const open = state.hasTag("open")
          send({ type: open ? "CLOSE" : "OPEN", src: "trigger" })
        },
      })
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs(scope.id),
        dir: prop("dir"),
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

    getContentState,
    getContentProps() {
      const contentState = getContentState()
      return normalize.element({
        ...parts.content.attrs(scope.id),
        dir: prop("dir"),
        role: "dialog",
        tabIndex: 0,
        hidden: !contentState.open,
        id: dom.getContentId(scope),
        "aria-labelledby": dom.getTitleId(scope),
        "data-state": contentState.open ? "open" : "closed",
        "data-dragging": dataAttr(contentState.dragging),
        "data-topmost": dataAttr(contentState.topmost),
        "data-behind": dataAttr(!contentState.topmost),
        "data-minimized": dataAttr(contentState.minimized),
        "data-maximized": dataAttr(contentState.maximized),
        "data-staged": dataAttr(contentState.staged),
        style: {
          width: "var(--width)",
          height: "var(--height)",
          overflow: contentState.minimized ? "hidden" : undefined,
        },
        onFocus() {
          send({ type: "CONTENT_FOCUS" })
        },
        onKeyDown(event) {
          if (event.defaultPrevented) return

          if (event.key === "Escape" && isTopmost) {
            send({ type: "ESCAPE" })
            return
          }

          if (event.currentTarget !== getEventTarget(event)) return

          const step = getEventStep(event) * prop("gridSize")
          const keyMap: EventKeyMap = {
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
        ...parts.closeTrigger.attrs(scope.id),
        dir: prop("dir"),
        disabled: prop("disabled"),
        "aria-label": "Close Window",
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          send({ type: "CLOSE" })
        },
      })
    },

    getStageTriggerState,
    getStageTriggerProps(props) {
      const stageTriggerState = getStageTriggerState(props)

      const translations = prop("translations")

      const ariaLabel = match(props.stage, {
        minimized: () => translations.minimize,
        maximized: () => translations.maximize,
        default: () => translations.restore,
      })

      return normalize.button({
        ...parts.stageTrigger.attrs(scope.id),
        dir: prop("dir"),
        disabled: prop("disabled"),
        "data-stage": stageTriggerState.stage,
        "aria-label": ariaLabel,
        hidden: stageTriggerState.hidden,
        type: "button",
        onClick(event) {
          if (event.defaultPrevented) return
          if (!prop("resizable")) return
          const type = match(props.stage, {
            minimized: () => "MINIMIZE",
            maximized: () => "MAXIMIZE",
            default: () => "RESTORE",
          })
          send({ type: type.toUpperCase() })
        },
      })
    },

    getResizeTriggerState,
    getResizeTriggerProps(props: ResizeTriggerProps) {
      const resizeTriggerState = getResizeTriggerState(props)
      return normalize.element({
        ...parts.resizeTrigger.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(resizeTriggerState.disabled),
        "data-placement": resizeTriggerState.placement,
        onPointerDown(event) {
          if (!canResize) return
          if (!isLeftClick(event)) return

          event.currentTarget.setPointerCapture(event.pointerId)
          event.stopPropagation()

          send({
            type: "RESIZE_START",
            placement: props.placement,
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
          ...getResizePlacementStyle(props.placement),
        },
      })
    },

    getDragTriggerProps() {
      return normalize.element({
        ...parts.dragTrigger.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(!canDrag),
        onPointerDown(event) {
          if (!canDrag) return
          if (!isLeftClick(event)) return

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
        onDoubleClick(event) {
          if (event.defaultPrevented) return
          if (!prop("resizable")) return
          send({ type: isStaged ? "RESTORE" : "MAXIMIZE" })
        },
        style: {
          WebkitUserSelect: "none",
          userSelect: "none",
          touchAction: "none",
          cursor: "move",
        },
      })
    },

    getControlState,
    getControlProps() {
      const controlState = getControlState()
      return normalize.element({
        ...parts.control.attrs(scope.id),
        dir: prop("dir"),
        "data-disabled": dataAttr(controlState.disabled),
        "data-stage": controlState.stage,
        "data-minimized": dataAttr(controlState.minimized),
        "data-maximized": dataAttr(controlState.maximized),
        "data-staged": dataAttr(controlState.staged),
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getTitleId(scope),
      })
    },

    getHeaderProps() {
      return normalize.element({
        ...parts.header.attrs(scope.id),
        dir: prop("dir"),
        "data-dragging": dataAttr(dragging),
        "data-topmost": dataAttr(isTopmost),
        "data-behind": dataAttr(!isTopmost),
        "data-minimized": dataAttr(isMinimized),
        "data-maximized": dataAttr(isMaximized),
        "data-staged": dataAttr(isStaged),
      })
    },

    getBodyProps() {
      return normalize.element({
        ...parts.body.attrs(scope.id),
        dir: prop("dir"),
        "data-dragging": dataAttr(dragging),
        "data-minimized": dataAttr(isMinimized),
        "data-maximized": dataAttr(isMaximized),
        "data-staged": dataAttr(isStaged),
        hidden: isMinimized,
      })
    },
  }
}
