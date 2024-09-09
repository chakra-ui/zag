import { createMachine, guards, subscribe } from "@zag-js/core"
import { addDomEvent } from "@zag-js/dom-event"
import { getOverflowAncestors } from "@zag-js/dom-query"
import { getPlacement } from "@zag-js/popper"
import { compact } from "@zag-js/utils"
import { dom } from "./tooltip.dom"
import { store } from "./tooltip.store"
import type { MachineContext, MachineState, UserDefinedContext } from "./tooltip.types"

const { and, not } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "tooltip",
      initial: ctx.open ? "open" : "closed",

      context: {
        openDelay: 1000,
        closeDelay: 500,
        closeOnPointerDown: true,
        closeOnEscape: true,
        interactive: false,
        closeOnScroll: true,
        closeOnClick: true,
        ...ctx,
        currentPlacement: undefined,
        hasPointerMoveOpened: false,
        positioning: {
          placement: "bottom",
          ...ctx.positioning,
        },
      },

      computed: {
        hasAriaLabel: (ctx) => !!ctx["aria-label"],
      },

      watch: {
        disabled: ["closeIfDisabled"],
        open: ["toggleVisibility"],
      },

      states: {
        closed: {
          tags: ["closed"],
          entry: ["clearGlobalId"],
          on: {
            "CONTROLLED.OPEN": "open",
            OPEN: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
            POINTER_LEAVE: {
              actions: ["clearPointerMoveOpened"],
            },
            POINTER_MOVE: [
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
          tags: ["closed"],
          activities: ["trackScroll", "trackPointerlockChange"],
          after: {
            OPEN_DELAY: [
              {
                guard: "isOpenControlled",
                actions: ["setPointerMoveOpened", "invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["setPointerMoveOpened", "invokeOnOpen"],
              },
            ],
          },
          on: {
            "CONTROLLED.OPEN": "open",
            "CONTROLLED.CLOSE": "closed",
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
            POINTER_LEAVE: [
              {
                guard: "isOpenControlled",
                actions: ["clearPointerMoveOpened", "invokeOnClose"],
              },
              {
                target: "closed",
                actions: ["clearPointerMoveOpened", "invokeOnClose"],
              },
            ],
            CLOSE: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
          },
        },

        open: {
          tags: ["open"],
          activities: ["trackEscapeKey", "trackScroll", "trackPointerlockChange", "trackPositioning"],
          entry: ["setGlobalId"],
          on: {
            "CONTROLLED.CLOSE": "closed",
            CLOSE: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
            POINTER_LEAVE: [
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
            "CONTENT.POINTER_LEAVE": {
              guard: "isInteractive",
              target: "closing",
            },
            "POSITIONING.SET": {
              actions: "reposition",
            },
          },
        },

        closing: {
          tags: ["open"],
          activities: ["trackStore", "trackPositioning"],
          after: {
            CLOSE_DELAY: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "closed",
                actions: ["invokeOnClose"],
              },
            ],
          },
          on: {
            "CONTROLLED.CLOSE": "closed",
            "CONTROLLED.OPEN": "open",
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
            POINTER_MOVE: [
              {
                guard: "isOpenControlled",
                actions: ["setPointerMoveOpened", "invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["setPointerMoveOpened", "invokeOnOpen"],
              },
            ],
            "CONTENT.POINTER_MOVE": {
              guard: "isInteractive",
              target: "open",
            },
            "POSITIONING.SET": {
              actions: "reposition",
            },
          },
        },
      },
    },
    {
      activities: {
        trackPositioning(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          const getPositionerEl = () => dom.getPositionerEl(ctx)
          return getPlacement(dom.getTriggerEl(ctx), getPositionerEl, {
            ...ctx.positioning,
            defer: true,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        trackPointerlockChange(ctx, _evt, { send }) {
          const onChange = () => send({ type: "CLOSE", src: "pointerlock:change" })
          return addDomEvent(dom.getDoc(ctx), "pointerlockchange", onChange, false)
        },
        trackScroll(ctx, _evt, { send }) {
          if (!ctx.closeOnScroll) return

          const triggerEl = dom.getTriggerEl(ctx)
          if (!triggerEl) return

          const overflowParents = getOverflowAncestors(triggerEl)

          const cleanups = overflowParents.map((overflowParent) => {
            const onScroll = () => {
              send({ type: "CLOSE", src: "scroll" })
            }
            return addDomEvent(overflowParent, "scroll", onScroll, { passive: true, capture: true })
          })

          return () => {
            cleanups.forEach((fn) => fn?.())
          }
        },
        trackStore(ctx, _evt, { send }) {
          return subscribe(store, () => {
            if (store.id !== ctx.id) {
              send({ type: "CLOSE", src: "id.change" })
            }
          })
        },
        trackEscapeKey(ctx, _evt, { send }) {
          if (!ctx.closeOnEscape) return
          const doc = dom.getDoc(ctx)
          return addDomEvent(doc, "keydown", (event) => {
            if (event.key === "Escape") {
              send({ type: "CLOSE", src: "keydown.escape" })
            }
          })
        },
      },
      actions: {
        setGlobalId(ctx) {
          store.setId(ctx.id)
        },
        clearGlobalId(ctx) {
          if (ctx.id === store.id) {
            store.setId(null)
          }
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        closeIfDisabled(ctx, _evt, { send }) {
          if (!ctx.disabled) return
          send({ type: "CLOSE", src: "disabled:change" })
        },
        reposition(ctx, evt) {
          const getPositionerEl = () => dom.getPositionerEl(ctx)
          getPlacement(dom.getTriggerEl(ctx), getPositionerEl, {
            ...ctx.positioning,
            ...evt.options,
            defer: true,
            listeners: false,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        toggleVisibility(ctx, evt, { send }) {
          send({ type: ctx.open ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: evt })
        },
        setPointerMoveOpened(ctx) {
          ctx.hasPointerMoveOpened = true
        },
        clearPointerMoveOpened(ctx) {
          ctx.hasPointerMoveOpened = false
        },
      },
      guards: {
        noVisibleTooltip: () => store.id === null,
        isVisible: (ctx) => ctx.id === store.id,
        isInteractive: (ctx) => ctx.interactive,
        hasPointerMoveOpened: (ctx) => !!ctx.hasPointerMoveOpened,
        isOpenControlled: (ctx) => !!ctx["open.controlled"],
      },
      delays: {
        OPEN_DELAY: (ctx) => ctx.openDelay,
        CLOSE_DELAY: (ctx) => ctx.closeDelay,
      },
    },
  )
}
