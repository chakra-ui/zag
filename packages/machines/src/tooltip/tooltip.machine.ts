import { createMachine, ref } from "@ui-machines/core"
import { addDomEvent, addPointerEvent } from "tiny-dom-event"
import { noop } from "tiny-fn"
import { isElement, isSafari } from "tiny-guard"
import { proxy, subscribe } from "valtio"

export const tooltipStore = proxy<{ id: string | null }>({ id: null })

export type TooltipMachineContext = {
  doc?: Document
  id: string
  disabled?: boolean
}

export type TooltipMachineState = {
  value: "unknown" | "opening" | "open" | "closing" | "closed"
}

export const tooltipMachine = createMachine<TooltipMachineContext, TooltipMachineState>(
  {
    id: "tooltip",
    initial: "unknown",
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
        entry: "clearGlobalId",
        on: {
          FOCUS: "open",
          POINTER_ENTER: [
            {
              cond: "noVisibleTooltip",
              target: "opening",
            },
            { target: "open" },
          ],
        },
      },

      opening: {
        after: {
          OPEN_DELAY: "open",
        },
        on: {
          POINTER_LEAVE: "closed",
          POINTER_DOWN: "closed",
        },
      },

      open: {
        activities: ["trackEscapeKey", "trackPointermoveForSafari"],
        entry: "setGlobalId",
        on: {
          POINTER_LEAVE: [
            {
              cond: "isVisible",
              target: "closing",
            },
            { target: "closed" },
          ],
          BLUR: "closing",
          ESCAPE: "closed",
          POINTER_DOWN: "closed",
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
        },
      },
    },
  },
  {
    activities: {
      trackStore(ctx, _evt, { send }) {
        return subscribe(tooltipStore, () => {
          if (tooltipStore.id !== ctx.id) {
            send("FORCE_CLOSE")
          }
        })
      },
      trackPointermoveForSafari: (ctx, _evt, { send }) => {
        if (!isSafari()) return noop
        const doc = ctx.doc ?? document
        return addPointerEvent(doc, "pointermove", (event) => {
          const selector = "[data-controls=tooltip][data-expanded]"
          if (isElement(event.target) && event.target.closest(selector)) return
          send("POINTER_LEAVE")
        })
      },
      trackEscapeKey: (ctx, _evt, { send }) => {
        const doc = ctx.doc ?? document
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
      setOwnerDocument: (ctx, evt) => {
        ctx.doc = ref(evt.doc)
      },
      setGlobalId: (ctx) => {
        tooltipStore.id = ctx.id
      },
      clearGlobalId: (ctx) => {
        if (ctx.id === tooltipStore.id) {
          tooltipStore.id = null
        }
      },
    },
    guards: {
      noVisibleTooltip: () => tooltipStore.id === null,
      isVisible: (ctx) => ctx.id === tooltipStore.id,
      isDisabled: (ctx) => !!ctx.disabled,
    },
    delays: {
      OPEN_DELAY: 250,
      CLOSE_DELAY: 500,
    },
  },
)
