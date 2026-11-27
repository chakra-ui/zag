import { getDismissableLayerAttrs, getDismissableLayerStyle } from "@zag-js/dismissable"
import { dataAttr, getEventPoint, getEventTarget, hasSelectionWithin, isLeftClick } from "@zag-js/dom-query"
import type { JSX, NormalizeProps, PropTypes } from "@zag-js/types"
import { clampValue, toPx } from "@zag-js/utils/number"
import { mergeWithDefault } from "@zag-js/utils/object"
import { parts } from "./drawer.anatomy"
import * as dom from "./drawer.dom"
import { defaultTranslations } from "./drawer.translations"
import {
  isSwipeIgnored,
  oppositeDirection,
  resolveSwipeDirection,
  type SwipeDirection as PhysicalDirection,
} from "@zag-js/dom-query/swipe"
import type {
  BackdropState,
  ContentState,
  DrawerApi,
  DrawerService,
  PositionerState,
  ResolvedSnapPoint,
  SwipeAreaProps,
  SwipeAreaState,
  TriggerProps,
  TriggerState,
} from "./drawer.types"

// the arrow pointing away from the closing edge expands
const EXPAND_KEYS: Record<PhysicalDirection, string> = {
  down: "ArrowUp",
  up: "ArrowDown",
  left: "ArrowRight",
  right: "ArrowLeft",
}
const COLLAPSE_KEYS: Record<PhysicalDirection, string> = {
  down: "ArrowDown",
  up: "ArrowUp",
  left: "ArrowLeft",
  right: "ArrowRight",
}

const SWIPE_OPEN_HIDDEN_OFFSET = 9999

function getSwipeOpenOffset(swipingOpen: boolean, dragOffset: number | null, contentSize: number | null) {
  if (!swipingOpen || dragOffset !== null) return null
  return contentSize ?? SWIPE_OPEN_HIDDEN_OFFSET
}

export function connect<T extends PropTypes>(service: DrawerService, normalize: NormalizeProps<T>): DrawerApi<T> {
  const { state, send, context, scope, prop, computed } = service
  const translations = mergeWithDefault(defaultTranslations, prop("translations"))

  const open = state.hasTag("open")
  const closed = state.matches("closed")
  const closing = state.matches("closing")
  const swipingOpen = state.matches("swipeOpen.dragging")

  const dragOffset = context.get("dragOffset")
  // the offset outlives the gesture, through a release's close or snap
  const dragging = state.matches("open.pressed") && dragOffset !== null
  const swiping = dragging || swipingOpen

  const triggerValue = context.get("triggerValue")
  const snapPoint = context.get("snapPoint")
  const swipeDirection = prop("swipeDirection")
  const physicalDirection = resolveSwipeDirection(swipeDirection, prop("dir"))
  const vertical = physicalDirection === "up" || physicalDirection === "down"
  const sign = physicalDirection === "up" || physicalDirection === "left" ? -1 : 1
  const contentSize = context.get("contentSize")
  const swipeStrength = context.get("swipeStrength")

  const resolvedActiveSnapPoint = context.get("resolvedActiveSnapPoint")
  const snapPointOffset = resolvedActiveSnapPoint?.offset ?? 0

  const nestedMetrics = context.get("nestedMetrics")
  const layer = context.get("layer")

  const swipeOpenOffset = getSwipeOpenOffset(swipingOpen, dragOffset, contentSize)
  const currentOffset = swipeOpenOffset ?? dragOffset ?? snapPointOffset
  const signedSnapPointOffset = sign * snapPointOffset

  const moved = dragOffset !== null || swipingOpen
  const swipeMovement = moved ? currentOffset - snapPointOffset : 0
  const signedMovement = sign * swipeMovement
  // 0 at rest, 1 closed; pulling it further open doesn't count
  const travelToClosed = (contentSize ?? 0) - snapPointOffset
  const swipeProgress =
    moved && travelToClosed > 0
      ? clampValue(Math.max(0, swipeMovement) / travelToClosed, 0, 1)
      : swipingOpen
        ? 1 // fully closed (transparent backdrop) until contentSize is measured
        : 0

  const signedCurrentOffset = sign * currentOffset
  const translateX = vertical ? 0 : signedCurrentOffset
  const translateY = vertical ? signedCurrentOffset : 0

  // -----------------------------------------------------------------------------
  // State getters: pure, serializable per-part state, independent of `normalize`
  // -----------------------------------------------------------------------------

  function getTriggerState(props: TriggerProps = {}): TriggerState {
    const { value } = props
    const current = value == null ? false : triggerValue === value
    return { value, current, open: value == null ? open : open && current }
  }

  function getBackdropState(): BackdropState {
    return {
      open,
      swiping,
      hidden: !open || (swipingOpen && dragOffset === null),
      nested: !!layer?.nested,
      hasNested: !!layer?.hasNested,
    }
  }

  function getPositionerState(): PositionerState {
    return {
      open,
      closed,
      swipeDirection: physicalDirection,
      nested: !!layer?.nested,
      hasNested: !!layer?.hasNested,
    }
  }

  function getContentState(): ContentState {
    return {
      open,
      modal: prop("modal"),
      expanded: resolvedActiveSnapPoint?.offset === 0,
      swiping,
      dragging,
      swipeDirection: physicalDirection,
      nestedDrawerOpen: nestedMetrics.open,
      nestedDrawerSwiping: nestedMetrics.swiping,
      nested: !!layer?.nested,
      hasNested: !!layer?.hasNested,
    }
  }

  function getSwipeAreaState(props: SwipeAreaProps = {}): SwipeAreaState {
    const disabled = props.disabled ?? false
    const direction = props.swipeDirection
      ? resolveSwipeDirection(props.swipeDirection, prop("dir"))
      : oppositeDirection(physicalDirection)
    return { direction, disabled, open, swiping: swipingOpen }
  }

  // -----------------------------------------------------------------------------
  // Prop getters
  // -----------------------------------------------------------------------------

  const swipeAxis = vertical ? "y" : "x"
  const canPress = () => state.hasTag("open") && !state.matches("closing")

  function sendPointerDown(event: JSX.PointerEvent<HTMLElement>, defer: boolean) {
    send({
      type: "POINTER_DOWN",
      point: getEventPoint(event),
      target: getEventTarget(event),
      pointerId: event.pointerId,
      pointerType: event.pointerType,
      defer,
    })
  }

  function onContentPointerDown(event: JSX.PointerEvent<HTMLElement>) {
    if (!canPress() || !isLeftClick(event) || isSwipeIgnored(event, swipeAxis)) return
    if (hasSelectionWithin(scope.getDoc(), dom.getContentEl(scope))) return
    // a mouse press may be a click or a text selection, so the drag waits for clear travel
    sendPointerDown(event, event.pointerType !== "touch")
  }

  function onGrabberPointerDown(event: JSX.PointerEvent<HTMLElement>) {
    if (!canPress() || !isLeftClick(event) || isSwipeIgnored(event, swipeAxis)) return
    sendPointerDown(event, false)
  }

  const snapSteps = getSnapSteps(computed("resolvedSnapPoints"))
  const currentStep = snapSteps.findIndex((point) => point.offset === snapPointOffset)
  const expanded = snapSteps.length > 0 && currentStep === snapSteps.length - 1

  const motionVars = getMotionVars({
    snapSteps,
    contentSize,
    offset: currentOffset,
    closed,
    swipeProgress,
    stack: nestedMetrics.count,
  })

  function setSnapStep(index: number) {
    const point = snapSteps[index]
    if (point) send({ type: "SNAP_POINT.SET", snapPoint: point.value })
  }

  return {
    open,
    modal: prop("modal"),
    dragging,
    setOpen(nextOpen, reason = "script") {
      send({ type: nextOpen ? "OPEN" : "CLOSE", src: reason, replaces: "open" })
    },

    snapPoints: prop("snapPoints"),
    swipeDirection,
    snapPoint,
    setSnapPoint(snapPoint) {
      send({ type: "SNAP_POINT.SET", snapPoint, replaces: "snapPoint" })
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

    getPositionerState,
    getPositionerProps() {
      const positionerState = getPositionerState()
      return normalize.element({
        ...parts.positioner.attrs(scope.id),
        dir: prop("dir"),
        hidden: positionerState.closed,
        "data-state": positionerState.open ? "open" : "closed",
        "data-swipe-direction": positionerState.swipeDirection,
        ...getDismissableLayerAttrs(layer),
        style: {
          ...getDismissableLayerStyle(layer),
          pointerEvents: closing || prop("modal") !== true ? "none" : undefined,
        },
      })
    },

    getContentState,
    getContentProps(props = { draggable: true }) {
      const movementX = vertical ? 0 : signedMovement
      const movementY = vertical ? signedMovement : 0
      const rendered = context.get("rendered")
      const contentState = getContentState()

      return normalize.element({
        ...parts.content.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getContentId(scope),
        tabIndex: -1,
        role: prop("role"),
        "aria-modal": contentState.modal === true,
        "aria-labelledby": rendered.title ? dom.getTitleId(scope) : undefined,
        "aria-describedby": rendered.description ? dom.getDescriptionId(scope) : undefined,
        hidden: !contentState.open,
        "data-state": contentState.open ? "open" : "closed",
        "data-expanded": contentState.expanded ? "" : undefined,
        "data-swipe-direction": contentState.swipeDirection,
        "data-snap-point": snapPoint != null ? String(snapPoint) : undefined,
        "data-swiping": contentState.swiping ? "" : undefined,
        "data-dragging": contentState.dragging ? "" : undefined,
        "data-nested-drawer-open": contentState.nestedDrawerOpen ? "" : undefined,
        "data-nested-drawer-swiping": contentState.nestedDrawerSwiping ? "" : undefined,
        ...getDismissableLayerAttrs(layer),
        style: {
          ...getDismissableLayerStyle(layer, { pointerEvents: true }),
          visibility: swipingOpen && dragOffset === null ? "hidden" : undefined,
          transform: "translate3d(var(--drawer-translate-x, 0px), var(--drawer-translate-y, 0px), 0)",
          transitionDuration: swiping ? "0s" : undefined,
          "--drawer-translate": toPx(translateY),
          "--drawer-translate-x": toPx(translateX),
          "--drawer-translate-y": toPx(translateY),
          "--drawer-snap-point-offset-x": vertical ? "0px" : toPx(signedSnapPointOffset),
          "--drawer-snap-point-offset-y": vertical ? toPx(signedSnapPointOffset) : "0px",
          "--drawer-swipe-movement-x": toPx(movementX),
          "--drawer-swipe-movement-y": toPx(movementY),
          "--drawer-swipe-strength": `${swipeStrength}`,
          ...motionVars,
          "--nested-drawers": `${nestedMetrics.count}`,
          "--drawer-height": nestedMetrics.height > 0 ? toPx(nestedMetrics.height) : undefined,
          "--drawer-frontmost-height":
            nestedMetrics.frontmostHeight > 0 ? toPx(nestedMetrics.frontmostHeight) : undefined,
          willChange: "transform",
        },
        onPointerDown(event) {
          if (!props.draggable) return
          onContentPointerDown(event)
        },
      })
    },

    getTitleProps() {
      return normalize.element({
        ...parts.title.attrs(scope.id),
        id: dom.getTitleId(scope),
        dir: prop("dir"),
      })
    },

    getDescriptionProps() {
      return normalize.element({
        ...parts.description.attrs(scope.id),
        id: dom.getDescriptionId(scope),
        dir: prop("dir"),
      })
    },

    triggerValue,
    setTriggerValue(value) {
      send({ type: "OPEN", value: value ?? undefined, src: "script" })
    },

    getTriggerState,
    getTriggerProps(props: TriggerProps = {}) {
      const { value } = props
      const triggerState = getTriggerState(props)
      const { current } = triggerState
      return normalize.button({
        ...parts.trigger.attrs(scope.id),
        dir: prop("dir"),
        id: dom.getTriggerId(scope, value),
        "data-value": value,
        "aria-haspopup": "dialog",
        type: "button",
        "aria-expanded": triggerState.open,
        "data-state": open ? "open" : "closed",
        "aria-controls": dom.getContentId(scope),
        "data-current": dataAttr(current),
        onClick(event) {
          if (event.defaultPrevented) return
          const shouldSwitch = open && value != null && !current
          send({ type: shouldSwitch ? "TRIGGER_VALUE.SET" : open ? "CLOSE" : "OPEN", value, src: "trigger-click" })
        },
      })
    },

    getBackdropState,
    getBackdropProps() {
      const backdropState = getBackdropState()
      return normalize.element({
        ...parts.backdrop.attrs(scope.id),
        hidden: backdropState.hidden,
        "data-state": backdropState.open ? "open" : "closed",
        "data-swiping": backdropState.swiping ? "" : undefined,
        ...getDismissableLayerAttrs(layer),
        style: {
          ...getDismissableLayerStyle(layer),
          willChange: "opacity",
          pointerEvents: closing ? "none" : undefined,
          "--drawer-swipe-progress": `${swipeProgress}`,
          "--drawer-swipe-strength": `${swipeStrength}`,
          ...motionVars,
        },
      })
    },

    getGrabberProps() {
      const steps = snapSteps.length > 1
      return normalize.element({
        ...parts.grabber.attrs(scope.id),
        role: steps ? "button" : undefined,
        tabIndex: steps ? 0 : undefined,
        "aria-label": steps ? translations.grabber : undefined,
        "aria-controls": steps ? dom.getContentId(scope) : undefined,
        "data-snap-point": snapPoint != null ? String(snapPoint) : undefined,
        "data-expanded": dataAttr(expanded),
        onPointerDown(event) {
          onGrabberPointerDown(event)
        },
        onClick(event) {
          if (!steps || event.defaultPrevented) return
          setSnapStep(getNextSnapStep(currentStep, 1, snapSteps.length, true))
        },
        onKeyDown(event) {
          if (!steps || event.defaultPrevented) return
          const index = getKeyboardSnapStep(event.key, physicalDirection, currentStep, snapSteps.length)
          if (index === undefined) return
          setSnapStep(index)
          event.preventDefault()
        },
        style: {
          touchAction: "none",
        },
      })
    },

    getGrabberIndicatorProps() {
      return normalize.element({
        ...parts.grabberIndicator.attrs(scope.id),
      })
    },

    getCloseTriggerProps() {
      return normalize.button({
        ...parts.closeTrigger.attrs(scope.id),
        type: "button",
        onClick() {
          send({ type: "CLOSE", src: "close-trigger" })
        },
      })
    },

    getSwipeAreaState,
    getSwipeAreaProps(props = {}) {
      const swipeAreaState = getSwipeAreaState(props)
      const { disabled, direction: physicalOpenDirection } = swipeAreaState

      return normalize.element({
        ...parts.swipeArea.attrs(scope.id),
        role: "presentation",
        "aria-hidden": true,
        "data-state": open ? "open" : "closed",
        "data-swiping": swipingOpen ? "" : undefined,
        "data-swipe-direction": physicalOpenDirection,
        "data-disabled": disabled ? "" : undefined,
        style: {
          touchAction: physicalOpenDirection === "up" || physicalOpenDirection === "down" ? "pan-x" : "pan-y",
          pointerEvents: disabled || (open && !swipingOpen) ? "none" : undefined,
        },
        onPointerDown(event) {
          if (disabled) return
          if (!isLeftClick(event)) return
          if (event.pointerType === "touch") return
          if (open && !swipingOpen) return
          send({
            type: "SWIPE_AREA.START",
            point: getEventPoint(event),
            pointerId: event.pointerId,
            pointerType: event.pointerType,
          })
          if (event.cancelable) event.preventDefault()
        },
        onTouchStart(event) {
          if (disabled) return
          if (open && !swipingOpen) return
          const touch = event.touches[0]
          if (!touch) return
          send({ type: "SWIPE_AREA.START", point: { x: touch.clientX, y: touch.clientY }, pointerType: "touch" })
        },
      })
    },
  }
}

/** Snap points from least to most revealed */
function getSnapSteps(points: ResolvedSnapPoint[]) {
  return [...points].sort((a, b) => b.offset - a.offset)
}

function getNextSnapStep(current: number, delta: 1 | -1, count: number, wrap = false) {
  const next = current + delta
  if (next >= count) return wrap ? 0 : count - 1
  return Math.max(next, 0)
}

function getKeyboardSnapStep(key: string, direction: PhysicalDirection, current: number, count: number) {
  if (key === EXPAND_KEYS[direction]) return getNextSnapStep(current, 1, count)
  if (key === COLLAPSE_KEYS[direction]) return getNextSnapStep(current, -1, count)
  if (key === "Home") return 0
  if (key === "End") return count - 1
  return undefined
}

interface MotionVarsOptions {
  snapSteps: ResolvedSnapPoint[]
  contentSize: number | null
  offset: number
  closed: boolean
  swipeProgress: number
  stack: number
}

/** The drawer's motion as 0-1 values, so styles don't have to combine pixel offsets */
function getMotionVars(options: MotionVarsOptions) {
  const { snapSteps, offset, closed, swipeProgress, stack } = options
  const contentSize = options.contentSize ?? 0
  const largest = snapSteps.at(-1)
  const second = snapSteps.at(-2)

  const fullSize = contentSize - (largest?.offset ?? 0)
  const progress = closed || fullSize <= 0 ? 0 : clampValue((contentSize - offset) / fullSize, 0, 1)
  const expand =
    largest && second && second.offset > largest.offset
      ? clampValue((second.offset - offset) / (second.offset - largest.offset), 0, 1)
      : progress

  return {
    "--drawer-progress": `${progress}`,
    "--drawer-dim": `${closed ? 0 : 1 - swipeProgress}`,
    "--drawer-expand": `${expand}`,
    "--drawer-stack": `${stack}`,
  }
}
