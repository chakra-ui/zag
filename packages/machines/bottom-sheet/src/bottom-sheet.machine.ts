import { createMachine } from "@zag-js/core"
import type { BottomSheetSchema } from "./bottom-sheet.types"
import type { Point } from "@zag-js/types"
import { trackPointerMove } from "@zag-js/dom-query"
import * as dom from "./bottom-sheet.dom"
import { resolveSnapPoints } from "./utils/resolve-snap-points"
import { trackDismissableElement } from "@zag-js/dismissable"

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
      pointerStartPoint: bindable<Point | null>(() => ({
        defaultValue: null,
      })),
    }
  },

  computed: {
    resolvedSnapPoints({ scope, prop }) {
      const contentEl = dom.getContentEl(scope)
      if (!contentEl) return null

      const rect = contentEl.getBoundingClientRect()
      const height = rect.height

      return resolveSnapPoints(prop("snapPoints"), height)
    },
  },

  initialState({ prop }) {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "closed"
  },

  states: {
    open: {
      tags: ["open"],
      effects: ["trackDismissableElement"],
      on: {
        CLOSE: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
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
        GRABBER_DRAG: {
          actions: ["setDragOffset"],
        },
        GRABBER_RELEASE: {
          target: "open",
          actions: ["clearDragOffset"],
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
      setPointerStart({ context, event }) {
        context.set("pointerStartPoint", event.point)
      },
      setDragOffset({ context, event }) {
        const startPoint = context.get("pointerStartPoint")
        if (startPoint == null) return

        let delta = startPoint.y - event.point.y

        if (delta > 0) delta = 0

        context.set("dragOffset", -delta)
      },
      clearDragOffset({ context }) {
        context.set("dragOffset", null)
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
    },
  },
})
