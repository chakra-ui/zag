import { createGuards, createMachine } from "@zag-js/core"
import { addDomEvent, getOverflowAncestors, isComposingEvent } from "@zag-js/dom-query"
import { trackFocusVisible as trackFocusVisibleFn } from "@zag-js/focus-visible"
import { getPlacement } from "@zag-js/popper"
import { subscribe } from "@zag-js/store"
import * as dom from "./tooltip.dom"
import { store } from "./tooltip.store"
import type { Placement, TooltipSchema } from "./tooltip.types"

const { and, not } = createGuards<TooltipSchema>()

export const machine = createMachine<TooltipSchema>({
  initialState: ({ prop }) => {
    const open = prop("open") || prop("defaultOpen")
    return open ? "open" : "closed"
  },

  props({ props }) {
    return {
      id: "x",
      openDelay: 1000,
      closeDelay: 500,
      closeOnPointerDown: true,
      closeOnEscape: true,
      interactive: false,
      closeOnScroll: true,
      closeOnClick: true,
      disabled: false,
      ...props,
      positioning: {
        placement: "bottom",
        ...props.positioning,
      },
    }
  },

  effects: ["trackFocusVisible", "trackStore"],

  context: ({ bindable }) => ({
    currentPlacement: bindable<Placement | undefined>(() => ({ defaultValue: undefined })),
    hasPointerMoveOpened: bindable<boolean>(() => ({ defaultValue: false })),
  }),

  watch({ track, action, prop }) {
    track([() => prop("disabled")], () => {
      action(["closeIfDisabled"])
    })

    track([() => prop("open")], () => {
      action(["toggleVisibility"])
    })
  },

  states: {
    closed: {
      entry: ["clearGlobalId"],
      on: {
        "controlled.open": {
          target: "open",
        },
        open: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
          },
        ],
        "pointer.leave": {
          actions: ["clearPointerMoveOpened"],
        },
        "pointer.move": [
          {
            guard: and("noVisibleTooltip", not("hasPointerMoveOpened")),
            target: "opening",
          },
          {
            guard: not("hasPointerMoveOpened"),
            target: "open",
            actions: ["setPointerMoveOpened", "invokeOnOpen"],
          },
        ],
      },
    },

    opening: {
      effects: ["trackScroll", "trackPointerlockChange", "waitForOpenDelay"],
      on: {
        "after.openDelay": [
          {
            guard: "isOpenControlled",
            actions: ["setPointerMoveOpened", "invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["setPointerMoveOpened", "invokeOnOpen"],
          },
        ],
        "controlled.open": {
          target: "open",
        },
        "controlled.close": {
          target: "closed",
        },
        open: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnOpen"],
          },
          {
            target: "open",
            actions: ["invokeOnOpen"],
          },
        ],
        "pointer.leave": [
          {
            guard: "isOpenControlled",
            // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
            actions: ["clearPointerMoveOpened", "invokeOnClose", "toggleVisibility"],
          },
          {
            target: "closed",
            actions: ["clearPointerMoveOpened", "invokeOnClose"],
          },
        ],
        close: [
          {
            guard: "isOpenControlled",
            // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
            actions: ["invokeOnClose", "toggleVisibility"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
      },
    },

    open: {
      effects: ["trackEscapeKey", "trackScroll", "trackPointerlockChange", "trackPositioning"],
      entry: ["setGlobalId"],
      on: {
        "controlled.close": {
          target: "closed",
        },
        close: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        "pointer.leave": [
          {
            guard: "isVisible",
            target: "closing",
            actions: ["clearPointerMoveOpened"],
          },
          // == group ==
          {
            guard: "isOpenControlled",
            actions: ["clearPointerMoveOpened", "invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["clearPointerMoveOpened", "invokeOnClose"],
          },
        ],
        "content.pointer.leave": {
          guard: "isInteractive",
          target: "closing",
        },
        "positioning.set": {
          actions: ["reposition"],
        },
      },
    },

    closing: {
      effects: ["trackPositioning", "waitForCloseDelay"],
      on: {
        "after.closeDelay": [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        "controlled.close": {
          target: "closed",
        },
        "controlled.open": {
          target: "open",
        },
        close: [
          {
            guard: "isOpenControlled",
            actions: ["invokeOnClose"],
          },
          {
            target: "closed",
            actions: ["invokeOnClose"],
          },
        ],
        "pointer.move": [
          {
            guard: "isOpenControlled",
            // We trigger toggleVisibility manually since the `ctx.open` has not changed yet (at this point)
            actions: ["setPointerMoveOpened", "invokeOnOpen", "toggleVisibility"],
          },
          {
            target: "open",
            actions: ["setPointerMoveOpened", "invokeOnOpen"],
          },
        ],
        "content.pointer.move": {
          guard: "isInteractive",
          target: "open",
        },
        "positioning.set": {
          actions: ["reposition"],
        },
      },
    },
  },

  implementations: {
    guards: {
      noVisibleTooltip: () => store.id === null,
      isVisible: ({ prop }) => prop("id") === store.id,
      isInteractive: ({ prop }) => !!prop("interactive"),
      hasPointerMoveOpened: ({ context }) => context.get("hasPointerMoveOpened"),
      isOpenControlled: ({ prop }) => prop("open") !== undefined,
    },

    actions: {
      setGlobalId: ({ prop }) => {
        store.id = prop("id")
      },

      clearGlobalId: ({ prop }) => {
        if (prop("id") === store.id) {
          store.id = null
        }
      },

      invokeOnOpen: ({ prop }) => {
        prop("onOpenChange")?.({ open: true })
      },

      invokeOnClose: ({ prop }) => {
        prop("onOpenChange")?.({ open: false })
      },

      closeIfDisabled: ({ prop, send }) => {
        if (!prop("disabled")) return
        send({ type: "close", src: "disabled.change" })
      },

      reposition: ({ context, event, prop, scope }) => {
        if (event.type !== "positioning.set") return
        const getPositionerEl = () => dom.getPositionerEl(scope)
        return getPlacement(dom.getTriggerEl(scope), getPositionerEl, {
          ...prop("positioning"),
          ...event.options,
          defer: true,
          listeners: false,
          onComplete(data) {
            context.set("currentPlacement", data.placement)
          },
        })
      },

      toggleVisibility: ({ prop, event, send }) => {
        queueMicrotask(() => {
          send({
            type: prop("open") ? "controlled.open" : "controlled.close",
            previousEvent: event,
          })
        })
      },

      setPointerMoveOpened: ({ context }) => {
        context.set("hasPointerMoveOpened", true)
      },

      clearPointerMoveOpened: ({ context }) => {
        context.set("hasPointerMoveOpened", false)
      },
    },
    effects: {
      trackFocusVisible: ({ scope }) => {
        return trackFocusVisibleFn({ root: scope.getRootNode?.() })
      },

      trackPositioning: ({ flush, context, prop, scope }) => {
        if (!context.get("currentPlacement")) {
          const positioning = prop("positioning")!
          context.set("currentPlacement", positioning.placement)
        }

        const getPositionerEl = () => dom.getPositionerEl(scope)
        return getPlacement(dom.getTriggerEl(scope), getPositionerEl, {
          ...prop("positioning"),
          defer: true,
          onComplete(data) {
            flush(() => {
              context.set("currentPlacement", data.placement)
            })
          },
        })
      },

      trackPointerlockChange: ({ send, scope }) => {
        const doc = scope.getDoc()
        const onChange = () => send({ type: "close", src: "pointerlock:change" })
        return addDomEvent(doc, "pointerlockchange", onChange, false)
      },

      trackScroll: ({ send, prop, scope }) => {
        if (!prop("closeOnScroll")) return

        const triggerEl = dom.getTriggerEl(scope)
        if (!triggerEl) return

        const overflowParents = getOverflowAncestors(triggerEl)

        const cleanups = overflowParents.map((overflowParent) => {
          const onScroll = () => {
            send({ type: "close", src: "scroll" })
          }
          return addDomEvent(overflowParent, "scroll", onScroll, {
            passive: true,
            capture: true,
          })
        })

        return () => {
          cleanups.forEach((fn) => fn?.())
        }
      },

      trackStore: ({ prop, send }) => {
        let cleanup: VoidFunction | undefined
        queueMicrotask(() => {
          cleanup = subscribe(store, () => {
            if (store.id !== prop("id")) {
              send({ type: "close", src: "id.change" })
            }
          })
        })
        return () => cleanup?.()
      },

      trackEscapeKey: ({ send, prop }) => {
        if (!prop("closeOnEscape")) return

        const onKeyDown = (event: KeyboardEvent) => {
          if (isComposingEvent(event)) return
          if (event.key !== "Escape") return
          event.stopPropagation()
          send({ type: "close", src: "keydown.escape" })
        }

        return addDomEvent(document, "keydown", onKeyDown, true)
      },

      waitForOpenDelay: ({ send, prop }) => {
        const id = setTimeout(() => {
          send({ type: "after.openDelay" })
        }, prop("openDelay"))
        return () => clearTimeout(id)
      },

      waitForCloseDelay: ({ send, prop }) => {
        const id = setTimeout(() => {
          send({ type: "after.closeDelay" })
        }, prop("closeDelay"))
        return () => clearTimeout(id)
      },
    },
  },
})
