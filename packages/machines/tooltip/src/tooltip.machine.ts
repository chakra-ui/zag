import { createMachine, ref, subscribe } from "@ui-machines/core"

import { isHTMLElement } from "@ui-machines/dom-utils"
import { addDomEvent, addPointerEvent } from "@ui-machines/dom-utils/listener"
import { addPointerlockChangeListener } from "@ui-machines/dom-utils/pointerlock"

import { noop, uuid } from "@ui-machines/utils"
import { isSafari } from "@ui-machines/utils/guard"

import { dom } from "./tooltip.dom"
import { tooltipStore } from "./tooltip.store"
import { TooltipMachineContext, TooltipMachineState } from "./tooltip.types"

export const tooltipMachine = createMachine<TooltipMachineContext, TooltipMachineState>(
  {
    id: "tooltip",
    initial: "unknown",
    context: {
      id: uuid(),
      openDelay: 700,
      closeDelay: 300,
      closeOnPointerDown: true,
      interactive: true,
    },
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "closed",
            actions: ["setOwnerDocument", "setId"],
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
        activities: ["trackWindowScroll", "trackPointerlockChange"],
        after: {
          OPEN_DELAY: "open",
        },
        on: {
          POINTER_LEAVE: "closed",
          POINTER_DOWN: {
            guard: "closeOnPointerDown",
            target: "closed",
          },
          SCROLL: "closed",
          POINTER_LOCK_CHANGE: "closed",
        },
      },

      open: {
        activities: ["trackEscapeKey", "trackPointermoveForSafari", "trackWindowScroll", "trackPointerlockChange"],
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
        activities: "trackStore",
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
      trackPointerlockChange(ctx, _evt, { send }) {
        return addPointerlockChangeListener(dom.getDoc(ctx), () => {
          send("POINTER_LOCK_CHANGE")
        })
      },
      trackWindowScroll(ctx, _evt, { send }) {
        const win = dom.getWin(ctx)
        return addDomEvent(
          win,
          "scroll",
          function onScroll() {
            send("SCROLL")
          },
          { passive: true, capture: true },
        )
      },
      trackStore(ctx, _evt, { send }) {
        return subscribe(tooltipStore, () => {
          if (tooltipStore.id !== ctx.id) {
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
      setId(ctx, evt) {
        ctx.id = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
      },
      setGlobalId(ctx) {
        tooltipStore.setId(ctx.id)
      },
      clearGlobalId(ctx) {
        if (ctx.id === tooltipStore.id) {
          tooltipStore.setId(null)
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
      noVisibleTooltip: () => tooltipStore.id === null,
      isVisible: (ctx) => ctx.id === tooltipStore.id,
      isDisabled: (ctx) => !!ctx.disabled,
      isInteractive: (ctx) => ctx.interactive,
    },
    delays: {
      OPEN_DELAY: (ctx) => ctx.openDelay,
      CLOSE_DELAY: (ctx) => ctx.closeDelay,
    },
  },
)
