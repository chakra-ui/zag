import { createMachine } from "@zag-js/core"
import type { BottomSheetSchema } from "./bottom-sheet.types"
import type { Point } from "@zag-js/types"
import { getInitialFocus, raf, trackPointerMove } from "@zag-js/dom-query"
import * as dom from "./bottom-sheet.dom"
import { resolveSnapPoints } from "./utils/resolve-snap-points"
import { trackDismissableElement } from "@zag-js/dismissable"
import { findClosestSnapPoint } from "./utils/find-closest-snap-point"

export const machine = createMachine<BottomSheetSchema>({
  props({ props }) {
    return {
      closeOnInteractOutside: true,
      closeOnEscape: true,
      snapPoints: [],
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
      effects: ["trackDismissableElement", "trackContentHeight"],
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
            actions: ["setInitialFocus", "invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setInitialFocus", "invokeOnOpen"],
          },
        ],
      },
    },

    panning: {
      tags: ["open"],
      effects: ["trackPointerMove"],
      on: {
        GRABBER_DRAG: {
          actions: ["setDragOffset"],
        },
        GRABBER_RELEASE: {
          target: "open",
          actions: ["setClosestSnapOffset", "clearDragOffset"],
        },
      },
    },
  },

  implementations: {
    guards: {
      isOpenControlled: ({ prop }) => prop("open") !== undefined,
    },

    actions: {
      invokeOnOpen({ prop }) {
        prop("onOpenChange")?.({ open: true })
      },

      invokeOnClose({ prop }) {
        prop("onOpenChange")?.({ open: false })
      },

      setInitialFocus({ scope }) {
        raf(() => {
          const element = getInitialFocus({
            root: dom.getContentEl(scope),
          })
          element?.focus({ preventScroll: true })
        })
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

        let delta = startPoint.y - event.point.y - (context.get("snapPointOffset") ?? 0)

        if (delta > 0) delta = 0

        context.set("dragOffset", -delta)
      },

      clearDragOffset({ context }) {
        context.set("dragOffset", null)
      },

      clearSnapOffset({ context }) {
        context.set("snapPointOffset", null)
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
