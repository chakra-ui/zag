import { getEventPoint, getEventTarget, isLeftClick } from "@zag-js/dom-query"
import type { JSX, NormalizeProps, PropTypes } from "@zag-js/types"
import { toPx } from "@zag-js/utils"
import { parts } from "./drawer.anatomy"
import * as dom from "./drawer.dom"
import type { DrawerApi, DrawerService } from "./drawer.types"

const isVerticalDirection = (direction: DrawerApi["swipeDirection"]) => direction === "down" || direction === "up"

const isNegativeDirection = (direction: DrawerApi["swipeDirection"]) => direction === "up" || direction === "left"

export function connect<T extends PropTypes>(service: DrawerService, normalize: NormalizeProps<T>): DrawerApi<T> {
  const { state, send, context, scope, prop } = service

  const open = state.hasTag("open")
  const closed = state.matches("closed")
  const dragOffset = context.get("dragOffset")
  const dragging = dragOffset !== null

  const snapPoint = context.get("snapPoint")
  const resolvedActiveSnapPoint = context.get("resolvedActiveSnapPoint")
  const swipeDirection = prop("swipeDirection")
  const contentSize = context.get("contentSize")
  const swipeStrength = context.get("swipeStrength")
  const snapPointOffset = resolvedActiveSnapPoint?.offset ?? 0
  const currentOffset = dragOffset ?? snapPointOffset
  const swipeMovement = dragging ? currentOffset - snapPointOffset : 0
  const signedCurrentOffset = isNegativeDirection(swipeDirection) ? -currentOffset : currentOffset
  const signedSnapPointOffset = isNegativeDirection(swipeDirection) ? -snapPointOffset : snapPointOffset
  const signedMovement = isNegativeDirection(swipeDirection) ? -swipeMovement : swipeMovement
  const swipeProgress =
    dragging && contentSize && contentSize > 0 ? Math.max(0, Math.min(1, Math.abs(signedMovement) / contentSize)) : 0
  const translateX = isVerticalDirection(swipeDirection) ? 0 : signedCurrentOffset
  const translateY = isVerticalDirection(swipeDirection) ? signedCurrentOffset : 0

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
    swipeDirection,
    snapPoint,
    setSnapPoint(snapPoint) {
      const currentSnapPoint = context.get("snapPoint")
      if (currentSnapPoint === snapPoint) return
      send({ type: "SNAP_POINT.SET", snapPoint })
    },

    getOpenPercentage() {
      if (!open) return 0

      if (!contentSize) return 0

      return Math.max(0, Math.min(1, 1 - currentOffset / contentSize))
    },

    getSnapPointIndex() {
      const snapPoints = prop("snapPoints")
      if (snapPoint === null) return -1
      return snapPoints.indexOf(snapPoint)
    },

    getContentSize() {
      return contentSize
    },

    getPositionerProps() {
      return normalize.element({
        ...parts.positioner.attrs,
        id: dom.getPositionerId(scope),
        dir: prop("dir"),
        hidden: closed,
        "data-state": open ? "open" : "closed",
        "data-swipe-direction": swipeDirection,
      })
    },

    getContentProps(props = { draggable: true }) {
      const movementX = isVerticalDirection(swipeDirection) ? 0 : signedMovement
      const movementY = isVerticalDirection(swipeDirection) ? signedMovement : 0

      return normalize.element({
        ...parts.content.attrs,
        dir: prop("dir"),
        id: dom.getContentId(scope),
        tabIndex: -1,
        role: prop("role"),
        "aria-modal": prop("modal"),
        "aria-labelledby": dom.getTitleId(scope),
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-expanded": resolvedActiveSnapPoint?.offset === 0 ? "" : undefined,
        "data-swipe-direction": swipeDirection,
        "data-swiping": dragging ? "" : undefined,
        "data-dragging": dragging ? "" : undefined,
        style: {
          transform: "translate3d(var(--drawer-translate-x, 0px), var(--drawer-translate-y, 0px), 0)",
          transitionDuration: dragging ? "0s" : undefined,
          "--drawer-translate": toPx(translateY),
          "--drawer-translate-x": toPx(translateX),
          "--drawer-translate-y": toPx(translateY),
          "--drawer-snap-point-offset-x": isVerticalDirection(swipeDirection) ? "0px" : toPx(signedSnapPointOffset),
          "--drawer-snap-point-offset-y": isVerticalDirection(swipeDirection) ? toPx(signedSnapPointOffset) : "0px",
          "--drawer-swipe-movement-x": toPx(movementX),
          "--drawer-swipe-movement-y": toPx(movementY),
          "--drawer-swipe-strength": `${swipeStrength}`,
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
        "data-swiping": dragging ? "" : undefined,
        style: {
          willChange: "opacity",
          "--drawer-swipe-progress": `${swipeProgress}`,
          "--drawer-swipe-strength": `${swipeStrength}`,
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
