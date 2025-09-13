import { createMachine } from "@zag-js/core"
import type { BottomSheetSchema, ResolvedSnapPoint } from "./bottom-sheet.types"
import type { Point } from "@zag-js/types"
import { addDomEvent, getEventPoint, getEventTarget, raf } from "@zag-js/dom-query"
import * as dom from "./bottom-sheet.dom"
import { resolveSnapPoint } from "./utils/resolve-snap-point"
import { trackDismissableElement } from "@zag-js/dismissable"
import { findClosestSnapPoint } from "./utils/find-closest-snap-point"
import { trapFocus } from "@zag-js/focus-trap"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import { ariaHidden } from "@zag-js/aria-hidden"
import { getScrollInfo } from "./utils/get-scroll-info"

export const machine = createMachine<BottomSheetSchema>({
  props({ props, scope }) {
    const alertDialog = props.role === "alertdialog"
    const initialFocusEl: any = alertDialog ? () => dom.getCloseTriggerEl(scope) : undefined
    const modal = typeof props.modal === "boolean" ? props.modal : true
    return {
      modal,
      trapFocus: modal,
      preventScroll: modal,
      closeOnInteractOutside: true,
      closeOnEscape: true,
      restoreFocus: true,
      initialFocusEl,
      snapPoints: [1],
      defaultActiveSnapPoint: 1,
      swipeVelocityThreshold: 500,
      closeThreshold: 0.25,
      preventDragOnScroll: true,
      ...props,
    }
  },

  context({ bindable, prop }) {
    return {
      pointerStart: bindable<Point | null>(() => ({
        defaultValue: null,
      })),
      dragOffset: bindable<number | null>(() => ({
        defaultValue: null,
      })),
      activeSnapPoint: bindable<number | string>(() => ({
        defaultValue: prop("defaultActiveSnapPoint"),
        value: prop("activeSnapPoint"),
        onChange(value) {
          return prop("onActiveSnapPointChange")?.({ snapPoint: value })
        },
      })),
      resolvedActiveSnapPoint: bindable<ResolvedSnapPoint | null>(() => ({
        defaultValue: null,
      })),
      contentHeight: bindable<number | null>(() => ({
        defaultValue: null,
      })),
      lastPoint: bindable<Point | null>(() => ({
        defaultValue: null,
      })),
      lastTimestamp: bindable<number | null>(() => ({
        defaultValue: null,
      })),
      velocity: bindable<number | null>(() => ({
        defaultValue: null,
      })),
    }
  },

  computed: {
    resolvedSnapPoints({ context, prop }) {
      const contentHeight = context.get("contentHeight")
      if (contentHeight === null) return []
      return prop("snapPoints").map((snapPoint) => resolveSnapPoint(snapPoint, contentHeight))
    },
  },

  watch({ track, context, prop, action }) {
    track([() => context.get("activeSnapPoint"), () => context.get("contentHeight")], () => {
      const activeSnapPoint = context.get("activeSnapPoint")
      const contentHeight = context.get("contentHeight")
      if (contentHeight === null) return

      const resolvedActiveSnapPoint = resolveSnapPoint(activeSnapPoint, contentHeight)
      context.set("resolvedActiveSnapPoint", resolvedActiveSnapPoint)
    })
    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "closed"
  },

  on: {
    SET_ACTIVE_SNAP_POINT: {
      actions: ["setActiveSnapPoint"],
    },
  },

  states: {
    open: {
      tags: ["open"],
      effects: [
        "trackDismissableElement",
        "preventScroll",
        "trapFocus",
        "hideContentBelow",
        "trackPointerMove",
        "trackContentHeight",
      ],
      on: {
        "CONTROLLED.CLOSE": {
          target: "closed",
        },
        POINTER_DOWN: [
          {
            actions: ["setPointerStart"],
          },
        ],
        POINTER_MOVE: [
          {
            guard: "shouldStartDragging",
            target: "open:dragging",
          },
        ],
        POINTER_UP: [
          {
            actions: ["clearPointerStart", "clearDragOffset"],
          },
        ],
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closing",
            actions: ["invokeOnClose"],
          },
        ],
      },
    },

    "open:dragging": {
      effects: ["trackDismissableElement", "preventScroll", "trapFocus", "hideContentBelow", "trackPointerMove"],
      tags: ["open", "dragging"],
      on: {
        POINTER_MOVE: [
          {
            actions: ["setDragOffset"],
          },
        ],
        POINTER_UP: [
          {
            guard: "shouldCloseOnSwipe",
            target: "closing",
          },
          {
            actions: ["setClosestSnapPoint", "clearPointerStart", "clearDragOffset"],
            target: "open",
          },
        ],
      },
    },

    closing: {
      effects: ["trackExitAnimation"],
      on: {
        ANIMATION_END: {
          target: "closed",
          actions: [
            "invokeOnClose",
            "clearPointerStart",
            "clearDragOffset",
            "clearActiveSnapPoint",
            "clearResolvedActiveSnapPoint",
            "clearContentHeight",
            "clearVelocityTracking",
          ],
        },
      },
    },

    closed: {
      tags: ["closed"],
      on: {
        "CONTROLLED.OPEN": {
          target: "open",
        },
        OPEN: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
          },
        ],
      },
    },
  },

  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop("open") !== undefined,

      shouldStartDragging({ prop, context, event, scope, send }) {
        const pointerStart = context.get("pointerStart")
        const container = dom.getContentEl(scope)
        if (!pointerStart || !container) return false

        const { point, target } = event

        if (prop("preventDragOnScroll")) {
          const delta = pointerStart.y - point.y

          if (Math.abs(delta) < 0.3) return false

          const { availableScroll, availableScrollTop } = getScrollInfo(target, container)

          if ((delta > 0 && Math.abs(availableScroll) > 1) || (delta < 0 && Math.abs(availableScrollTop) > 0)) {
            send({ type: "POINTER_UP", point })
            return false
          }
        }

        return true
      },

      shouldCloseOnSwipe({ prop, context, computed }) {
        const velocity = context.get("velocity")
        const dragOffset = context.get("dragOffset")
        const contentHeight = context.get("contentHeight")
        const swipeVelocityThreshold = prop("swipeVelocityThreshold")
        const closeThreshold = prop("closeThreshold")
        const snapPoints = computed("resolvedSnapPoints")

        if (dragOffset === null || contentHeight === null || velocity === null) return false

        const visibleHeight = contentHeight - dragOffset
        const smallestSnapPoint = snapPoints.reduce((acc, curr) => (curr.offset > acc.offset ? curr : acc))

        const isFastSwipe = velocity > 0 && velocity >= swipeVelocityThreshold

        const closeThresholdInPixels = contentHeight * (1 - closeThreshold)
        const isBelowSmallestSnapPoint = visibleHeight < contentHeight - smallestSnapPoint.offset
        const isBelowCloseThreshold = visibleHeight < closeThresholdInPixels

        const hasEnoughDragToDismiss = (isBelowCloseThreshold && isBelowSmallestSnapPoint) || visibleHeight === 0

        return isFastSwipe || hasEnoughDragToDismiss
      },
    },

    actions: {
      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true })
      },

      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false })
      },

      setActiveSnapPoint({ context, event }) {
        context.set("activeSnapPoint", event.snapPoint)
      },

      setPointerStart({ event, context }) {
        context.set("pointerStart", event.point)
      },

      setDragOffset({ context, event }) {
        const pointerStart = context.get("pointerStart")
        if (!pointerStart) return

        const { point } = event

        const currentTimestamp = new Date().getTime()

        const lastPoint = context.get("lastPoint")
        if (lastPoint) {
          const dy = point.y - lastPoint.y

          const lastTimestamp = context.get("lastTimestamp")
          if (lastTimestamp) {
            const dt = currentTimestamp - lastTimestamp
            if (dt > 0) {
              context.set("velocity", (dy / dt) * 1000)
            }
          }
        }

        context.set("lastPoint", point)
        context.set("lastTimestamp", currentTimestamp)

        let delta = pointerStart.y - point.y - (context.get("resolvedActiveSnapPoint")?.offset || 0)
        if (delta > 0) delta = 0

        context.set("dragOffset", -delta)
      },

      setClosestSnapPoint({ computed, context }) {
        const snapPoints = computed("resolvedSnapPoints")
        const contentHeight = context.get("contentHeight")
        const dragOffset = context.get("dragOffset")

        if (!snapPoints || contentHeight === null || dragOffset === null) return

        const closestSnapPoint = findClosestSnapPoint(dragOffset, snapPoints)

        context.set("activeSnapPoint", closestSnapPoint.value)
      },

      clearDragOffset({ context }) {
        context.set("dragOffset", null)
      },

      clearActiveSnapPoint({ context, prop }) {
        context.set("activeSnapPoint", prop("defaultActiveSnapPoint"))
      },

      clearResolvedActiveSnapPoint({ context }) {
        context.set("resolvedActiveSnapPoint", null)
      },

      clearPointerStart({ context }) {
        context.set("pointerStart", null)
      },

      clearContentHeight({ context }) {
        context.set("contentHeight", null)
      },

      clearVelocityTracking({ context }) {
        context.set("lastPoint", null)
        context.set("lastTimestamp", null)
        context.set("velocity", null)
      },

      toggleVisibility({ event, send, prop }) {
        send({ type: prop("open") ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: event })
      },
    },

    effects: {
      trackDismissableElement({ scope, prop, send }) {
        const getContentEl = () => dom.getContentEl(scope)
        return trackDismissableElement(getContentEl, {
          defer: true,
          exclude: [dom.getTriggerEl(scope)],
          onInteractOutside(event) {
            prop("onInteractOutside")?.(event)
            if (!prop("closeOnInteractOutside")) {
              event.preventDefault()
            }
          },
          onFocusOutside: prop("onFocusOutside"),
          onEscapeKeyDown(event) {
            prop("onEscapeKeyDown")?.(event)
            if (!prop("closeOnEscape")) {
              event.preventDefault()
            }
          },
          onPointerDownOutside: prop("onPointerDownOutside"),
          onRequestDismiss: prop("onRequestDismiss"),
          onDismiss() {
            send({ type: "CLOSE", src: "interact-outside" })
          },
        })
      },

      preventScroll({ scope, prop }) {
        if (!prop("preventScroll")) return
        return preventBodyScroll(scope.getDoc())
      },

      trapFocus({ scope, prop }) {
        if (!prop("trapFocus")) return
        const contentEl = () => dom.getContentEl(scope)
        return trapFocus(contentEl, {
          preventScroll: true,
          returnFocusOnDeactivate: !!prop("restoreFocus"),
          initialFocus: prop("initialFocusEl"),
          setReturnFocus: (el) => prop("finalFocusEl")?.() || el,
        })
      },

      hideContentBelow({ scope, prop }) {
        if (!prop("modal")) return
        const getElements = () => [dom.getContentEl(scope)]
        return ariaHidden(getElements, { defer: true })
      },

      trackPointerMove({ scope, send, prop }) {
        let lastY = 0

        function onPointerMove(event: PointerEvent) {
          const point = getEventPoint(event)
          const target = getEventTarget<Element>(event)
          send({ type: "POINTER_MOVE", point, target })
        }

        function onPointerUp(event: PointerEvent) {
          if (event.pointerType !== "touch") {
            const point = getEventPoint(event)
            send({ type: "POINTER_UP", point })
          }
        }

        function onTouchStart(event: TouchEvent) {
          if (!event.touches[0]) return
          lastY = event.touches[0].clientY
        }

        function onTouchMove(event: TouchEvent) {
          if (!event.touches[0]) return
          const point = getEventPoint(event)
          const target = event.target as HTMLElement

          if (!prop("preventDragOnScroll")) {
            send({ type: "POINTER_MOVE", point, target })
            return
          }

          // Prevent overscrolling
          const contentEl = dom.getContentEl(scope)
          if (!contentEl) return
          let el: HTMLElement | null = target
          while (el && el !== contentEl && el.scrollHeight <= el.clientHeight) {
            el = el.parentElement
          }

          if (el && el !== contentEl) {
            const scrollTop = el.scrollTop
            const y = event.touches[0].clientY

            const atTop = scrollTop <= 0

            if (atTop && y > lastY) {
              event.preventDefault()
            }

            lastY = y
          }

          send({ type: "POINTER_MOVE", point, target })
        }

        function onTouchEnd(event: TouchEvent) {
          if (event.touches.length !== 0) return
          const point = getEventPoint(event)
          send({ type: "POINTER_UP", point })
        }

        const cleanups = [
          addDomEvent(scope.getDoc(), "pointermove", onPointerMove),
          addDomEvent(scope.getDoc(), "pointerup", onPointerUp),
          addDomEvent(scope.getDoc(), "touchstart", onTouchStart, { passive: false }),
          addDomEvent(scope.getDoc(), "touchmove", onTouchMove, { passive: false }),
          addDomEvent(scope.getDoc(), "touchend", onTouchEnd),
        ]

        return () => {
          cleanups.forEach((cleanup) => cleanup())
        }
      },

      trackContentHeight({ context, scope }) {
        const contentEl = dom.getContentEl(scope)
        if (!contentEl) return

        const win = scope.getWin()

        const updateHeight = () => {
          const rect = contentEl.getBoundingClientRect()
          context.set("contentHeight", rect.height)
        }

        updateHeight()

        const observer = new win.ResizeObserver(() => {
          updateHeight()
        })
        observer.observe(contentEl)

        return () => {
          observer.disconnect()
        }
      },

      trackExitAnimation({ send, scope }) {
        let cleanup: VoidFunction | undefined

        const rafCleanup = raf(() => {
          const contentEl = dom.getContentEl(scope)
          if (!contentEl) return

          const animationName = getComputedStyle(contentEl).animationName
          const hasNoAnimation = !animationName || animationName === "none"

          if (hasNoAnimation) {
            send({ type: "ANIMATION_END" })
            return
          }

          const onEnd = (event: AnimationEvent) => {
            const target = getEventTarget<Element>(event)
            if (target === contentEl) {
              send({ type: "ANIMATION_END" })
            }
          }

          contentEl.addEventListener("animationend", onEnd)

          cleanup = () => {
            contentEl.removeEventListener("animationend", onEnd)
          }
        })

        return () => {
          rafCleanup()
          cleanup?.()
        }
      },
    },
  },
})
