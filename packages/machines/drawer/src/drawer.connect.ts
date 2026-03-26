import { dataAttr, getEventPoint, isLeftClick } from "@zag-js/dom-query"
import type { JSX, NormalizeProps, PropTypes } from "@zag-js/types"
import { clampValue, compact, toPx } from "@zag-js/utils"
import { parts } from "./drawer.anatomy"
import * as dom from "./drawer.dom"
import { oppositeSwipeDirection, resolveSwipeDirection } from "./utils/drawer-session"
import { isNegativeSwipeDirection, isVerticalSwipeDirection } from "./utils/session"
import type { DrawerApi, DrawerService, TriggerProps } from "./drawer.types"

const SWIPE_OPEN_HIDDEN_OFFSET = 9999

function getSwipeOpenOffset(swipingOpen: boolean, dragOffset: number | null, contentSize: number | null) {
  if (!swipingOpen || dragOffset !== null) return null
  return contentSize ?? SWIPE_OPEN_HIDDEN_OFFSET
}

export function connect<T extends PropTypes>(service: DrawerService, normalize: NormalizeProps<T>): DrawerApi<T> {
  const { state, send, context, scope, prop, refs } = service

  const open = state.hasTag("open")
  const closed = state.matches("closed")
  const closing = state.matches("closing")
  const swipingOpen = state.matches("swiping-open")

  const dragOffset = context.get("dragOffset")
  const dragging = dragOffset !== null

  const triggerValue = context.get("triggerValue")
  const snapPoint = context.get("snapPoint")
  const swipeDirection = prop("swipeDirection")
  const physicalDirection = resolveSwipeDirection(swipeDirection, prop("dir"))
  const contentSize = context.get("contentSize")
  const swipeStrength = context.get("swipeStrength")

  const resolvedActiveSnapPoint = context.get("resolvedActiveSnapPoint")
  const snapPointOffset = resolvedActiveSnapPoint?.offset ?? 0

  const swipeOpenOffset = getSwipeOpenOffset(swipingOpen, dragOffset, contentSize)
  const currentOffset = swipeOpenOffset ?? dragOffset ?? snapPointOffset
  const signedSnapPointOffset = isNegativeSwipeDirection(physicalDirection) ? -snapPointOffset : snapPointOffset

  const isActivelySwiping = dragging || swipingOpen
  const swipeMovement = dragging || swipingOpen ? currentOffset - snapPointOffset : 0
  const signedMovement = isNegativeSwipeDirection(physicalDirection) ? -swipeMovement : swipeMovement
  const swipeProgress =
    isActivelySwiping && contentSize && contentSize > 0
      ? clampValue(Math.abs(signedMovement) / contentSize, 0, 1)
      : swipingOpen
        ? 1 // fully closed (transparent backdrop) until contentSize is measured
        : 0

  const signedCurrentOffset = isNegativeSwipeDirection(physicalDirection) ? -currentOffset : currentOffset
  const translateX = isVerticalSwipeDirection(physicalDirection) ? 0 : signedCurrentOffset
  const translateY = isVerticalSwipeDirection(physicalDirection) ? signedCurrentOffset : 0

  function onContentPointerDown(event: JSX.PointerEvent<HTMLElement>) {
    refs.get("swipeSession").contentPointerDown({
      event,
      getDoc: () => scope.getDoc(),
      getContentEl: () => dom.getContentEl(scope),
      getWin: () => scope.getWin(),
      swipeDirection: physicalDirection,
      canCommit: () => state.hasTag("open") && !state.matches("closing"),
      onCommit(point) {
        send({ type: "POINTER_DOWN", point })
      },
    })
  }

  function onGrabberPointerDown(event: JSX.PointerEvent<HTMLElement>) {
    refs.get("swipeSession").grabberPointerDown({
      event,
      point: getEventPoint(event),
      canCommit: () => state.hasTag("open") && !state.matches("closing"),
      onCommit(point) {
        send({ type: "POINTER_DOWN", point })
      },
    })
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
      if (!open || !contentSize) return 0
      return clampValue(1 - currentOffset / contentSize, 0, 1)
    },

    getSnapPointIndex() {
      if (snapPoint === null) return -1
      return prop("snapPoints").indexOf(snapPoint)
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
        "data-swipe-direction": physicalDirection,
        style: compact<JSX.CSSProperties>({
          pointerEvents: closing || !prop("modal") ? "none" : undefined,
        }),
      })
    },

    getContentProps(props = { draggable: true }) {
      const movementX = isVerticalSwipeDirection(physicalDirection) ? 0 : signedMovement
      const movementY = isVerticalSwipeDirection(physicalDirection) ? signedMovement : 0
      const rendered = context.get("rendered")

      return normalize.element({
        ...parts.content.attrs,
        dir: prop("dir"),
        id: dom.getContentId(scope),
        tabIndex: -1,
        role: prop("role"),
        "aria-modal": prop("modal"),
        "aria-labelledby": rendered.title ? dom.getTitleId(scope) : undefined,
        "aria-describedby": rendered.description ? dom.getDescriptionId(scope) : undefined,
        hidden: !open,
        "data-state": open ? "open" : "closed",
        "data-expanded": resolvedActiveSnapPoint?.offset === 0 ? "" : undefined,
        "data-swipe-direction": physicalDirection,
        "data-swiping": dragging || swipingOpen ? "" : undefined,
        "data-dragging": dragging ? "" : undefined,
        style: compact<JSX.CSSProperties>({
          pointerEvents: prop("modal") ? undefined : "auto",
          visibility: swipingOpen && dragOffset === null ? "hidden" : undefined,
          transform: "translate3d(var(--drawer-translate-x, 0px), var(--drawer-translate-y, 0px), 0)",
          transitionDuration: dragging || swipingOpen ? "0s" : undefined,
          "--drawer-translate": toPx(translateY),
          "--drawer-translate-x": toPx(translateX),
          "--drawer-translate-y": toPx(translateY),
          "--drawer-snap-point-offset-x": isVerticalSwipeDirection(physicalDirection)
            ? "0px"
            : toPx(signedSnapPointOffset),
          "--drawer-snap-point-offset-y": isVerticalSwipeDirection(physicalDirection)
            ? toPx(signedSnapPointOffset)
            : "0px",
          "--drawer-swipe-movement-x": toPx(movementX),
          "--drawer-swipe-movement-y": toPx(movementY),
          "--drawer-swipe-strength": `${swipeStrength}`,
          willChange: "transform",
        }),
        onPointerDown(event) {
          if (!props.draggable) return
          onContentPointerDown(event)
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

    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs,
        id: dom.getDescriptionId(scope),
        dir: prop("dir"),
      })
    },

    triggerValue,
    setTriggerValue(value) {
      send({ type: "OPEN", value: value ?? undefined })
    },

    getTriggerProps(props: TriggerProps = {}) {
      const { value } = props
      const current = value == null ? false : triggerValue === value
      return normalize.button({
        ...parts.trigger.attrs,
        dir: prop("dir"),
        id: dom.getTriggerId(scope, value),
        "data-ownedby": scope.id,
        "data-value": value,
        "aria-haspopup": "dialog",
        type: "button",
        "aria-expanded": value == null ? open : open && current,
        "data-state": open ? "open" : "closed",
        "aria-controls": dom.getContentId(scope),
        "data-current": dataAttr(current),
        onClick(event) {
          if (event.defaultPrevented) return
          const shouldSwitch = open && value != null && !current
          send({ type: shouldSwitch ? "TRIGGER_VALUE.SET" : open ? "CLOSE" : "OPEN", value })
        },
      })
    },

    getBackdropProps() {
      return normalize.element({
        ...parts.backdrop.attrs,
        id: dom.getBackdropId(scope),
        hidden: !open || (swipingOpen && dragOffset === null),
        "data-state": open ? "open" : "closed",
        "data-swiping": dragging || swipingOpen ? "" : undefined,
        style: {
          willChange: "opacity",
          pointerEvents: closing ? "none" : undefined,
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
          onGrabberPointerDown(event)
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

    getSwipeAreaProps(props = {}) {
      const disabled = props.disabled ?? false
      const openDirection = props.swipeDirection ?? oppositeSwipeDirection[swipeDirection]
      const physicalOpenDirection = resolveSwipeDirection(openDirection, prop("dir"))

      return normalize.element({
        ...parts.swipeArea.attrs,
        id: dom.getSwipeAreaId(scope),
        role: "presentation",
        "aria-hidden": true,
        "data-state": open ? "open" : "closed",
        "data-swiping": swipingOpen ? "" : undefined,
        "data-swipe-direction": physicalOpenDirection,
        "data-disabled": disabled ? "" : undefined,
        style: {
          touchAction: isVerticalSwipeDirection(physicalOpenDirection) ? "pan-x" : "pan-y",
          pointerEvents: disabled || (open && !swipingOpen) ? "none" : undefined,
        },
        onPointerDown(event) {
          if (disabled) return
          if (!isLeftClick(event)) return
          if (event.pointerType === "touch") return
          if (open && !swipingOpen) return
          send({ type: "SWIPE_AREA.START", point: getEventPoint(event) })
          if (event.cancelable) event.preventDefault()
        },
        onTouchStart(event) {
          if (disabled) return
          if (open && !swipingOpen) return
          const touch = event.touches[0]
          if (!touch) return
          send({ type: "SWIPE_AREA.START", point: { x: touch.clientX, y: touch.clientY } })
        },
      })
    },
  }
}
