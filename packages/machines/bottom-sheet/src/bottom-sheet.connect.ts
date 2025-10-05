import { getEventPoint, getEventTarget, isLeftClick } from "@zag-js/dom-query"
import type { JSX, NormalizeProps, PropTypes } from "@zag-js/types"
import { toPx } from "@zag-js/utils"
import { parts } from "./bottom-sheet.anatomy"
import * as dom from "./bottom-sheet.dom"
import type { BottomSheetApi, BottomSheetService } from "./bottom-sheet.types"

export function connect<T extends PropTypes>(
  service: BottomSheetService,
  normalize: NormalizeProps<T>,
): BottomSheetApi<T> {
  const { state, send, context, scope, prop } = service

  const open = state.hasTag("open")
  const dragOffset = context.get("dragOffset")
  const dragging = dragOffset !== null

  const activeSnapPoint = context.get("activeSnapPoint")
  const resolvedActiveSnapPoint = context.get("resolvedActiveSnapPoint")
  const translate = dragOffset ?? resolvedActiveSnapPoint?.offset

  function onPointerDown(event: JSX.PointerEvent<HTMLElement>) {
    if (!isLeftClick(event)) return
    const target = getEventTarget<HTMLElement>(event)
    if (target?.hasAttribute("data-no-drag") || target?.closest("[data-no-drag]")) return
    if (state.matches("closing")) return
    send({ type: "POINTER_DOWN", point: getEventPoint(event) })
  }

  return {
    open,
    dragging,
    setOpen(nextOpen) {
      const open = state.hasTag("open")
      if (open === nextOpen) return
      send({ type: nextOpen ? "OPEN" : "CLOSE" })
    },

    snapPoints: prop("snapPoints"),
    activeSnapPoint,
    setActiveSnapPoint(snapPoint) {
      const activeSnapPoint = context.get("activeSnapPoint")
      if (activeSnapPoint === snapPoint) return
      send({ type: "ACTIVE_SNAP_POINT.SET", snapPoint })
    },

    getOpenPercentage() {
      if (!open) return 0

      const contentHeight = context.get("contentHeight")
      if (!contentHeight) return 0

      const currentOffset = translate ?? 0
      // Inverted: when offset is 0 (fully open), percentage is 1
      return Math.max(0, Math.min(1, 1 - currentOffset / contentHeight))
    },

    getActiveSnapIndex() {
      const snapPoints = prop("snapPoints")
      return snapPoints.indexOf(activeSnapPoint)
    },

    getContentHeight() {
      return context.get("contentHeight")
    },

    getContentProps(props = { draggable: true }) {
      return normalize.element({
        ...parts.content.attrs,
        dir: prop("dir"),
        id: dom.getContentId(scope),
        tabIndex: -1,
        role: "dialog",
        "aria-modal": prop("modal"),
        "aria-labelledby": dom.getTitleId(scope),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        style: {
          transform: "translate3d(0, var(--bottom-sheet-translate, 0), 0)",
          transitionDuration: dragging ? "0s" : undefined,
          "--bottom-sheet-translate": toPx(translate),
          willChange: "transform",
        },
        onPointerDown(event) {
          if (!props.draggable) return
          onPointerDown(event)
        },
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs,
        id: dom.getTitleId(scope),
        dir: prop("dir"),
      })
    },

    getTriggerProps() {
      return normalize.button({
        ...parts.trigger.attrs,
        id: dom.getTriggerId(scope),
        type: "button",
        onClick() {
          send({ type: open ? "CLOSE" : "OPEN" })
        },
      })
    },

    getBackdropProps() {
      return normalize.element({
        ...parts.backdrop.attrs,
        id: dom.getBackdropId(scope),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        style: {
          willChange: "opacity",
        },
      })
    },

    getGrabberProps() {
      return normalize.element({
        ...parts.grabber.attrs,
        id: dom.getGrabberId(scope),
        onPointerDown(event) {
          onPointerDown(event)
        },
        style: {
          touchAction: "none",
        },
      })
    },

    getGrabberIndicatorProps() {
      return normalize.element({
        ...parts.grabberIndicator.attrs,
        id: dom.getGrabberIndicatorId(scope),
      })
    },

    getCloseTriggerProps() {
      return normalize.button({
        ...parts.closeTrigger.attrs,
        id: dom.getCloseTriggerId(scope),
        onClick() {
          send({ type: "CLOSE" })
        },
      })
    },
  }
}
