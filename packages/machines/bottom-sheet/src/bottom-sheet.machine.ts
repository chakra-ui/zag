import { createMachine } from "@zag-js/core"
import type { BottomSheetSchema } from "./bottom-sheet.types"
import type { Point } from "@zag-js/types"
import { trackPointerMove } from "@zag-js/dom-query"
import * as dom from "./bottom-sheet.dom"
import { resolveSnapPoints } from "./utils/resolve-snap-points"
import { trackDismissableElement } from "@zag-js/dismissable"
import { findClosestSnapPoint } from "./utils/find-closest-snap-point"
import { trapFocus } from "@zag-js/focus-trap"

export const machine = createMachine<BottomSheetSchema>({
  props({ props, scope }) {
    const alertDialog = props.role === "alertdialog"
    const initialFocusEl: any = alertDialog ? () => dom.getCloseTriggerEl(scope) : undefined
    const modal = typeof props.modal === "boolean" ? props.modal : true
    return {
      modal,
      trapFocus: modal,
      closeOnInteractOutside: true,
      closeOnEscape: true,
      restoreFocus: true,
      initialFocusEl,
      snapPoints: ["100%"],
      closeThreshold: 0.5,
      ...props,
    }
  },

  context({ bindable }) {
    return {
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
      effects: ["trackDismissableElement", "trapFocus", "trackContentHeight"],
      on: {
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose", "clearSnapOffset"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose", "clearSnapOffset"],
          },
        ],
        GRABBER_POINTERDOWN: [
          {
            target: "panning",
            actions: ["setPointerStart"],
          },
        ],
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

    panning: {
      tags: ["open"],
      effects: ["trackPointerMove"],
      on: {
        GRABBER_DRAG: [
          {
            actions: ["setDragOffset"],
          },
        ],
        GRABBER_RELEASE: [
          {
            guard: "shouldCloseOnSwipe",
            actions: ["invokeOnClose", "clearSnapOffset", "clearDragOffset"],
            target: "closed",
          },
          {
            target: "open",
            actions: ["setClosestSnapOffset", "clearDragOffset", "resetVelocityTracking"],
          },
        ],
      },
    },
  },

  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop("open") !== undefined,

      shouldCloseOnSwipe({ prop, context }) {
        const velocity = context.get("velocity")
        const closeThreshold = prop("closeThreshold")

        return velocity > 0 && velocity >= closeThreshold
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
        const snapPoints = computed("resolvedSnapPoints")
        const closestSnapPoint = findClosestSnapPoint(window.innerHeight - event.point.y, snapPoints)

        context.set("snapPointOffset", context.get("contentHeight") - closestSnapPoint)
      },

      setDragOffset({ context, event }) {
        const startPoint = context.get("pointerStartPoint")
        if (startPoint == null) return

        const currentPoint = event.point
        const currentTimestamp = performance.now()

        let delta = startPoint.y - currentPoint.y - (context.get("snapPointOffset") ?? 0)

        const lastPoint = context.get("lastPoint")
        if (lastPoint) {
          const dy = currentPoint.y - lastPoint.y

          const lastTimestamp = context.get("lastTimestamp")
          if (lastTimestamp) {
            const dt = currentTimestamp - lastTimestamp
            if (dt > 0) {
              context.set("velocity", dy / dt)
            }
          }
        }

        context.set("lastPoint", currentPoint)
        context.set("lastTimestamp", currentTimestamp)

        if (delta > 0) delta = 0

        context.set("dragOffset", -delta)
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
          onDismiss() {
            send({ type: "CLOSE", src: "interact-outside" })
          },
        })
      },

      trapFocus({ scope, prop }) {
        if (!prop("trapFocus")) return
        const contentEl = () => dom.getContentEl(scope)
        return trapFocus(contentEl, {
          preventScroll: true,
          returnFocusOnDeactivate: !!prop("restoreFocus"),
          initialFocus: prop("initialFocusEl"),
          setReturnFocus: (el) => prop("finalFocusEl")?.() ?? el,
        })
      },

      trackPointerMove({ send, scope }) {
        return trackPointerMove(scope.getDoc(), {
          onPointerMove({ point }) {
            send({ type: "GRABBER_DRAG", point })
          },
          onPointerUp({ point }) {
            send({ type: "GRABBER_RELEASE", point })
          },
        })
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
