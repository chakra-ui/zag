import { createMachine, ref, subscribe } from "@ui-machines/core"
import {
  addDomEvent,
  addPointerEvent,
  addPointerlockChangeListener,
  getScrollParents,
  isHTMLElement,
  raf,
} from "@ui-machines/dom-utils"
import { getPlacement } from "@ui-machines/popper"
import { isSafari, noop } from "@ui-machines/utils"
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
      interactive: true,
      placementOptions: { placement: "bottom" },
      currentPlacement: undefined,
    },

    computed: {
      hasAriaLabel: (ctx) => !!ctx["aria-label"],
      isPlacementComplete: (ctx) => !!ctx.currentPlacement,
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
        activities: ["trackScroll", "trackPointerlockChange"],
        after: {
          OPEN_DELAY: "open",
        },
        on: {
          POINTER_LEAVE: "closed",
          BLUR: "closed",
          POINTER_DOWN: {
            guard: "closeOnPointerDown",
            target: "closed",
          },
          SCROLL: "closed",
          POINTER_LOCK_CHANGE: "closed",
        },
      },

      open: {
        tags: ["visible"],
        activities: [
          "trackEscapeKey",
          "trackPointermoveForSafari",
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
          BLUR: "closing",
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
          PRESS_ENTER: "closed",
        },
      },

      closing: {
        tags: ["visible"],
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
        ctx.currentPlacement = ctx.placementOptions.placement
        let cleanup: VoidFunction
        raf(() => {
          const arrow = dom.getArrowEl(ctx)
          cleanup = getPlacement(dom.getTriggerEl(ctx), dom.getPositionerEl(ctx), {
            ...ctx.placementOptions,
            arrow: arrow ? { ...ctx.placementOptions.arrow, element: arrow } : undefined,
            onPlacementComplete(placement) {
              ctx.currentPlacement = placement
            },
            onCleanup() {
              ctx.currentPlacement = undefined
            },
          })
        })
        return () => cleanup?.()
      },
      trackPointerlockChange(ctx, _evt, { send }) {
        return addPointerlockChangeListener(dom.getDoc(ctx), () => {
          send("POINTER_LOCK_CHANGE")
        })
      },
      trackScroll(ctx, _evt, { send }) {
        const cleanups = getScrollParents(dom.getTriggerEl(ctx)!).map((el) => {
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
      trackPointermoveForSafari(ctx, _evt, { send }) {
        if (!isSafari()) return noop
        const doc = dom.getDoc(ctx)
        return addPointerEvent(doc, "pointermove", (event) => {
          const selector = "[data-controls=tooltip][data-expanded]"
          if (isHTMLElement(event.target) && event.target.closest(selector)) return
          send("POINTER_LEAVE")
        })
      },
      trackEscapeKey(ctx, _evt, { send }) {
        const doc = dom.getDoc(ctx)
        return addDomEvent(doc, "keydown", (event) => {
          if (event.key === "Escape" || event.key === "Esc") {
            send("ESCAPE")
          }
        })
      },
    },
    actions: {
      setupDocument(ctx, evt) {
        ctx.id = evt.id
        ctx.doc = ref(evt.doc)
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
      isDisabled: (ctx) => !!ctx.disabled,
      isInteractive: (ctx) => ctx.interactive,
    },
    delays: {
      OPEN_DELAY: (ctx) => ctx.openDelay,
      CLOSE_DELAY: (ctx) => ctx.closeDelay,
    },
  },
)
