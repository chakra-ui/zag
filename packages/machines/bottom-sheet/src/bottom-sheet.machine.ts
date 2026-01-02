import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { addDomEvent, getEventPoint, getEventTarget, raf, resizeObserverBorderBox } from "@zag-js/dom-query"
import { trapFocus } from "@zag-js/focus-trap"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import * as dom from "./bottom-sheet.dom"
import type { BottomSheetSchema, ResolvedSnapPoint } from "./bottom-sheet.types"
import { DragManager } from "./utils/drag-manager"
import { resolveSnapPoint } from "./utils/resolve-snap-point"

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
      swipeVelocityThreshold: 700,
      closeThreshold: 0.25,
      preventDragOnScroll: true,
      ...props,
    }
  },

  context({ bindable, prop }) {
    return {
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
    }
  },

  refs() {
    return {
      dragManager: new DragManager(),
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
    "ACTIVE_SNAP_POINT.SET": {
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
        POINTER_DOWN: {
          actions: ["setPointerStart"],
        },
        POINTER_MOVE: [
          {
            guard: "isDragging",
            actions: ["setDragOffset"],
          },
          {
            guard: "shouldStartDragging",
            actions: ["setDragOffset"],
          },
        ],
        POINTER_UP: [
          {
            guard: "shouldCloseOnSwipe",
            target: "closing",
          },
          {
            guard: "isDragging",
            actions: ["setClosestSnapPoint", "clearPointerStart", "clearDragOffset"],
          },
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

      isDragging({ context }) {
        return context.get("dragOffset") !== null
      },

      shouldStartDragging({ prop, refs, event, scope }) {
        const dragManager = refs.get("dragManager")
        return dragManager.shouldStartDragging(
          event.point,
          event.target,
          dom.getContentEl(scope),
          prop("preventDragOnScroll"),
        )
      },

      shouldCloseOnSwipe({ prop, context, computed, refs }) {
        const dragManager = refs.get("dragManager")
        return dragManager.shouldDismiss(
          context.get("contentHeight"),
          computed("resolvedSnapPoints"),
          prop("swipeVelocityThreshold"),
          prop("closeThreshold"),
        )
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

      setPointerStart({ event, refs }) {
        refs.get("dragManager").setPointerStart(event.point)
      },

      setDragOffset({ context, event, refs }) {
        const dragManager = refs.get("dragManager")
        dragManager.setDragOffset(event.point, context.get("resolvedActiveSnapPoint")?.offset || 0)
        context.set("dragOffset", dragManager.getDragOffset())
      },

      setClosestSnapPoint({ computed, context, refs }) {
        const snapPoints = computed("resolvedSnapPoints")
        const contentHeight = context.get("contentHeight")

        if (!snapPoints.length || contentHeight === null) return

        const dragManager = refs.get("dragManager")
        const closestSnapPoint = dragManager.findClosestSnapPoint(snapPoints)

        // Set activeSnapPoint
        context.set("activeSnapPoint", closestSnapPoint)

        // Also resolve and set immediately to prevent visual snap flash
        const resolved = resolveSnapPoint(closestSnapPoint, contentHeight)
        context.set("resolvedActiveSnapPoint", resolved)
      },

      clearDragOffset({ context, refs }) {
        refs.get("dragManager").clearDragOffset()
        context.set("dragOffset", null)
      },

      clearActiveSnapPoint({ context, prop }) {
        context.set("activeSnapPoint", prop("defaultActiveSnapPoint"))
      },

      clearResolvedActiveSnapPoint({ context }) {
        context.set("resolvedActiveSnapPoint", null)
      },

      clearPointerStart({ refs }) {
        refs.get("dragManager").clearPointerStart()
      },

      clearContentHeight({ context }) {
        context.set("contentHeight", null)
      },

      clearVelocityTracking({ refs }) {
        refs.get("dragManager").clearVelocityTracking()
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
          getShadowRoot: true,
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
          if (event.pointerType === "touch") return
          const point = getEventPoint(event)
          send({ type: "POINTER_UP", point })
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

        const doc = scope.getDoc()

        const cleanups = [
          addDomEvent(doc, "pointermove", onPointerMove),
          addDomEvent(doc, "pointerup", onPointerUp),
          addDomEvent(doc, "touchstart", onTouchStart, { passive: false }),
          addDomEvent(doc, "touchmove", onTouchMove, { passive: false }),
          addDomEvent(doc, "touchend", onTouchEnd),
        ]

        return () => {
          cleanups.forEach((cleanup) => cleanup())
        }
      },

      trackContentHeight({ context, scope }) {
        const contentEl = dom.getContentEl(scope)
        if (!contentEl) return

        const updateHeight = () => {
          const rect = contentEl.getBoundingClientRect()
          context.set("contentHeight", rect.height)
        }

        updateHeight()
        return resizeObserverBorderBox.observe(contentEl, updateHeight)
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
