import { createMachine, ref, subscribe } from "@zag-js/core"
import {
  addDomEvent,
  addPointerEvent,
  addPointerlockChangeListener,
  getScrollParents,
  isHTMLElement,
  raf,
} from "@zag-js/dom-utils"
import { getPlacement } from "@zag-js/popper"
import { isSafari, noop } from "@zag-js/utils"
import { dom } from "./tooltip.dom"
import { store } from "./tooltip.store"
import { MachineContext, MachineState } from "./tooltip.types"

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "tooltip",
    initial: "unknown",

    context: {
      id: "",
      openDelay: 1000,
      closeDelay: 500,
      closeOnPointerDown: true,
      closeOnEsc: true,
      interactive: true,
      positioning: { placement: "bottom" },
      currentPlacement: undefined,
    },

    computed: {
      hasAriaLabel: (ctx) => !!ctx["aria-label"],
      isPlacementComplete: (ctx) => !!ctx.currentPlacement,
    },

    on: {
      OPEN: "open",
      CLOSE: "closed",
    },

    states: {
      unknown: {
        on: {
          SETUP: {
            target: "closed",
            actions: "setupDocument",
          },
        },
      },

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
          "computePlacement",
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
        },
      },

      closing: {
        tags: ["open"],
        activities: ["trackStore", "computePlacement"],
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
      computePlacement(ctx) {
        ctx.currentPlacement = ctx.positioning.placement
        let cleanup: VoidFunction | undefined
        raf(() => {
          cleanup = getPlacement(dom.getTriggerEl(ctx), dom.getPositionerEl(ctx), {
            ...ctx.positioning,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
            onCleanup() {
              ctx.currentPlacement = undefined
            },
          })
        })
        return cleanup
      },
      trackPointerlockChange(ctx, _evt, { send }) {
        return addPointerlockChangeListener(dom.getDoc(ctx), () => {
          send("POINTER_LOCK_CHANGE")
        })
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
        if (!isSafari()) return noop
        const doc = dom.getDoc(ctx)
        return addPointerEvent(doc, "pointermove", (event) => {
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
      setupDocument(ctx, evt) {
        ctx.id = evt.id
        if (evt.doc) ctx.doc = ref(evt.doc)
      },
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
      invokeOnClose(ctx, evt) {
        const omit = ["SETUP"]
        if (!omit.includes(evt.type)) {
          ctx.onClose?.()
        }
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
