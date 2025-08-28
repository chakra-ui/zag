import { createMachine } from "@zag-js/core"
import type { BottomSheetSchema } from "./bottom-sheet.types"
import type { Point } from "@zag-js/types"
import { addDomEvent, getEventPoint, getEventTarget, raf, trackPointerMove } from "@zag-js/dom-query"
import * as dom from "./bottom-sheet.dom"
import { resolveSnapPoints } from "./utils/resolve-snap-points"
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
      swipeVelocityThreshold: 0.5,
      closeThreshold: 0.25,
      grabberOnly: false,
      handleScrollableElements: true,
      ...props,
    }
  },

  context({ bindable }) {
    return {
      isDragging: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      isPointerDown: bindable<boolean>(() => ({
        defaultValue: false,
      })),
      dragOffset: bindable<number | null>(() => ({
        defaultValue: null,
      })),
      snapPointOffset: bindable<number | null>(() => ({
        defaultValue: null,
      })),
      pointerStartPoint: bindable<Point | null>(() => ({
        defaultValue: null,
      })),
      contentHeight: bindable<number>(() => ({
        defaultValue: 0,
      })),
      lastPoint: bindable<Point | null>(() => ({
        defaultValue: null,
      })),
      lastTimestamp: bindable<number | null>(() => ({
        defaultValue: null,
      })),
      velocity: bindable<number>(() => ({
        defaultValue: 0,
      })),
    }
  },

  computed: {
    resolvedSnapPoints({ context, prop }) {
      const contentHeight = context.get("contentHeight")
      if (contentHeight === 0) return []
      return resolveSnapPoints(prop("snapPoints"), contentHeight)
    },
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "closed"
  },

  states: {
    open: {
      tags: ["open"],
      effects: [
        "trackDismissableElement",
        "trackPointerMove",
        "trackTouchMove",
        "trapFocus",
        "preventScroll",
        "hideContentBelow",
        "trackContentHeight",
      ],
      on: {
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose", "clearSnapOffset"],
          },
          {
            target: "closing",
            actions: ["invokeOnClose", "clearSnapOffset"],
          },
        ],
        GRABBER_POINTERDOWN: [
          {
            actions: ["setPointerStart", "setPointerDown"],
          },
        ],
        GRABBER_DRAG: [
          {
            actions: ["setDragOffset"],
          },
        ],
        GRABBER_RELEASE: [
          {
            guard: "shouldCloseOnSwipe",
            target: "closing",
          },
          {
            target: "open",
            actions: [
              "setClosestSnapOffset",
              "clearDragOffset",
              "resetVelocityTracking",
              "clearDragging",
              "clearPointerDown",
            ],
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
            "clearSnapOffset",
            "clearDragOffset",
            "resetVelocityTracking",
            "clearDragging",
            "clearPointerDown",
          ],
        },
      },
    },

    closed: {
      tags: ["closed"],
      on: {
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

      shouldCloseOnSwipe({ prop, context, computed }) {
        const velocity = context.get("velocity")
        const dragOffset = context.get("dragOffset")
        const contentHeight = context.get("contentHeight")
        const swipeVelocityThreshold = prop("swipeVelocityThreshold")
        const closeThreshold = prop("closeThreshold")
        const resolvedSnapPoints = computed("resolvedSnapPoints")

        if (!dragOffset) return false
        const visibleHeight = contentHeight - dragOffset

        const isFastSwipe = velocity > 0 && velocity >= swipeVelocityThreshold

        const closeThresholdInPixels = contentHeight * (1 - closeThreshold)
        const isBelowSmallestSnapPoint = resolvedSnapPoints ? visibleHeight < resolvedSnapPoints[0] : true
        const isBelowcloseThreshold = visibleHeight < closeThresholdInPixels

        const hasEnoughDragToDismiss = (isBelowcloseThreshold && isBelowSmallestSnapPoint) || visibleHeight === 0

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

      setPointerStart({ context, event }) {
        context.set("pointerStartPoint", event.point)
      },

      setClosestSnapOffset({ computed, context, event }) {
        if (!context.get("isDragging")) return
        const snapPoints = computed("resolvedSnapPoints")
        if (!snapPoints) return

        const closestSnapPoint = findClosestSnapPoint(window.innerHeight - event.point.y, snapPoints)

        context.set("snapPointOffset", context.get("contentHeight") - closestSnapPoint)
      },

      setPointerDown({ context }) {
        context.set("isPointerDown", true)
      },

      setDragOffset({ context, event, prop, scope, send }) {
        if (!context.get("isPointerDown")) return

        const startPoint = context.get("pointerStartPoint")
        if (startPoint == null) return

        const { point, target } = event
        const currentTimestamp = performance.now()

        const container = dom.getContentEl(scope)
        if (!container) return

        let delta = startPoint.y - point.y - (context.get("snapPointOffset") ?? 0)

        if (prop("handleScrollableElements")) {
          const { availableScrollTop } = getScrollInfo(target, container)

          const isTryingToScrollDown = availableScrollTop === 0 && delta > 0
          const isTryingToScrollUp = availableScrollTop > 0 && delta < 0

          if ((isTryingToScrollDown || isTryingToScrollUp) && !context.get("isDragging")) {
            send({ type: "GRABBER_RELEASE", point })
            return
          }
        }

        context.set("isDragging", true)

        const lastPoint = context.get("lastPoint")
        if (lastPoint) {
          const dy = point.y - lastPoint.y

          const lastTimestamp = context.get("lastTimestamp")
          if (lastTimestamp) {
            const dt = currentTimestamp - lastTimestamp
            if (dt > 0) {
              context.set("velocity", dy / dt)
            }
          }
        }

        context.set("lastPoint", point)
        context.set("lastTimestamp", currentTimestamp)

        if (delta > 0) delta = 0

        context.set("dragOffset", -delta)
      },

      clearDragging({ context }) {
        context.set("isDragging", false)
      },

      clearPointerDown({ context }) {
        context.set("isPointerDown", false)
      },

      clearDragOffset({ context }) {
        context.set("dragOffset", null)
      },

      clearSnapOffset({ context }) {
        context.set("snapPointOffset", null)
      },

      resetVelocityTracking({ context }) {
        context.set("lastPoint", null)
        context.set("lastTimestamp", null)
        context.set("velocity", 0)
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

      trackPointerMove({ send, scope, context }) {
        return trackPointerMove(scope.getDoc(), {
          onPointerMove({ point, event }) {
            if (!context.get("isPointerDown")) return
            send({ type: "GRABBER_DRAG", point, target: event.target })
          },
          onPointerUp({ point, event }) {
            if (event.pointerType !== "touch") send({ type: "GRABBER_RELEASE", point })
          },
        })
      },

      trackTouchMove({ send, scope }) {
        function onTouchMove(event: TouchEvent) {
          if (!event.touches[0]) return
          const point = getEventPoint(event)
          send({ type: "GRABBER_DRAG", point, target: event.target })
        }

        function onTouchEnd(event: TouchEvent) {
          if (event.touches.length !== 0) return
          const point = getEventPoint(event)
          send({ type: "GRABBER_RELEASE", point })
        }

        const cleanups = [
          addDomEvent(scope.getDoc(), "touchmove", onTouchMove),
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
    },
  },
})
