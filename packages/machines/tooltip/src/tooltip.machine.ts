import { createMachine, subscribe } from "@zag-js/core"
import { addDomEvent } from "@zag-js/dom-event"
import { getScrollParents, isHTMLElement, isSafari } from "@zag-js/dom-query"
import { getPlacement } from "@zag-js/popper"
import { compact } from "@zag-js/utils"
import { dom } from "./tooltip.dom"
import { store } from "./tooltip.store"
import type { MachineContext, MachineState, UserDefinedContext } from "./tooltip.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "tooltip",
      initial: "closed",

      context: {
        openDelay: 1000,
        closeDelay: 500,
        closeOnPointerDown: true,
        closeOnEsc: true,
        interactive: true,
        currentPlacement: undefined,
        ...ctx,
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

      on: {
        OPEN: "open",
        CLOSE: "closed",
      },

      states: {
        closed: {
          tags: ["closed"],
          entry: ["clearGlobalId", "invokeOnClose"],
          on: {
            FOCUS: "open",
            POINTER_ENTER: [
              {
                guard: "noVisibleTooltip",
                target: "opening",
              },
              { target: "open" },
            ],
          },
        },

        opening: {
          tags: ["closed"],
          activities: ["trackScroll", "trackPointerlockChange"],
          after: {
            OPEN_DELAY: "open",
          },
          on: {
            POINTER_LEAVE: "closed",
            BLUR: "closed",
            SCROLL: "closed",
            POINTER_LOCK_CHANGE: "closed",
            POINTER_DOWN: {
              guard: "closeOnPointerDown",
              target: "closed",
            },
          },
        },

        open: {
          tags: ["open"],
          activities: [
            "trackEscapeKey",
            "trackDisabledTriggerOnSafari",
            "trackScroll",
            "trackPointerlockChange",
            "trackPositioning",
          ],
          entry: ["setGlobalId", "invokeOnOpen"],
          on: {
            POINTER_LEAVE: [
              {
                guard: "isVisible",
                target: "closing",
              },
              { target: "closed" },
            ],
            BLUR: "closed",
            ESCAPE: "closed",
            SCROLL: "closed",
            POINTER_LOCK_CHANGE: "closed",
            TOOLTIP_POINTER_LEAVE: {
              guard: "isInteractive",
              target: "closing",
            },
            POINTER_DOWN: {
              guard: "closeOnPointerDown",
              target: "closed",
            },
            CLICK: "closed",
            SET_POSITIONING: {
              actions: "setPositioning",
            },
          },
        },

        closing: {
          tags: ["open"],
          activities: ["trackStore", "trackPositioning"],
          after: {
            CLOSE_DELAY: "closed",
          },
          on: {
            FORCE_CLOSE: "closed",
            POINTER_ENTER: "open",
            TOOLTIP_POINTER_ENTER: {
              guard: "isInteractive",
              target: "open",
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
            onCleanup() {
              ctx.currentPlacement = undefined
            },
          })
        },
        trackPointerlockChange(ctx, _evt, { send }) {
          const onChange = () => send("POINTER_LOCK_CHANGE")
          return addDomEvent(dom.getDoc(ctx), "pointerlockchange", onChange, false)
        },
        trackScroll(ctx, _evt, { send }) {
          const trigger = dom.getTriggerEl(ctx)
          if (!trigger) return
          const cleanups = getScrollParents(trigger).map((el) => {
            const opts = { passive: true, capture: true } as const
            return addDomEvent(el, "scroll", () => send("SCROLL"), opts)
          })
          return () => {
            cleanups.forEach((fn) => fn?.())
          }
        },
        trackStore(ctx, _evt, { send }) {
          return subscribe(store, () => {
            if (store.id !== ctx.id) {
              send("FORCE_CLOSE")
            }
          })
        },
        trackDisabledTriggerOnSafari(ctx, _evt, { send }) {
          if (!isSafari()) return
          const doc = dom.getDoc(ctx)
          return addDomEvent(doc, "pointermove", (event) => {
            const selector = "[data-part=trigger][data-expanded]"
            if (isHTMLElement(event.target) && event.target.closest(selector)) return
            send("POINTER_LEAVE")
          })
        },
        trackEscapeKey(ctx, _evt, { send }) {
          if (!ctx.closeOnEsc) return
          const doc = dom.getDoc(ctx)
          return addDomEvent(doc, "keydown", (event) => {
            if (event.key === "Escape") {
              send("ESCAPE")
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
        invokeOnOpen(ctx, evt) {
          const omit = ["TOOLTIP_POINTER_ENTER", "POINTER_ENTER"]
          if (!omit.includes(evt.type)) {
            ctx.onOpen?.()
          }
        },
        invokeOnClose(ctx) {
          ctx.onClose?.()
        },
        closeIfDisabled(ctx, _evt, { send }) {
          if (ctx.disabled) {
            send("CLOSE")
          }
        },
        setPositioning(ctx, evt) {
          const getPositionerEl = () => dom.getPositionerEl(ctx)
          getPlacement(dom.getTriggerEl(ctx), getPositionerEl, {
            ...ctx.positioning,
            ...evt.options,
            defer: true,
            listeners: false,
          })
        },
        toggleVisibility(ctx, _evt, { send }) {
          send({ type: ctx.open ? "OPEN" : "CLOSE", src: "controlled" })
        },
      },
      guards: {
        closeOnPointerDown: (ctx) => ctx.closeOnPointerDown,
        noVisibleTooltip: () => store.id === null,
        isVisible: (ctx) => ctx.id === store.id,
        isInteractive: (ctx) => ctx.interactive,
      },
      delays: {
        OPEN_DELAY: (ctx) => ctx.openDelay,
        CLOSE_DELAY: (ctx) => ctx.closeDelay,
      },
    },
  )
}
