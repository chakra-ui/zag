import { createMachine, preserve } from "@ui-machines/core"
import { addPointerEvent } from "@core-dom/event/pointer"
import { proxy, subscribe } from "valtio"
import { env, is, noop } from "@core-foundation/utils"

export const tooltipStore = proxy<{ id: string | null }>({ id: null })

export type TooltipMachineContext = {
  doc?: Document
  id: string
  disabled?: boolean
}

export type TooltipMachineState = {
  value: "unknown" | "idle" | "opening" | "open" | "closing" | "closed"
}

export const tooltipMachine = createMachine<TooltipMachineContext, TooltipMachineState>(
  {
    id: "tooltip",
    initial: "unknown",
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "idle",
            actions: ["setOwnerDocument", "setId"],
          },
        },
      },

      idle: {
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

      closed: {
        entry: "clearGlobalId",
        on: {
          POINTER_ENTER: [
            {
              cond: "noVisibleTooltip",
              target: "opening",
            },
            { target: "open" },
          ],
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
        if (!env.safari()) return noop
        const doc = ctx.doc ?? document
        return addPointerEvent(doc, "pointermove", (event) => {
          if (is.domTarget(event) && event.target.closest("[data-controls=tooltip][data-expanded]")) {
            return
          }
          send("POINTER_LEAVE")
        })
      },
      trackEscapeKey: (ctx, _evt, { send }) => {
        const doc = ctx.doc ?? document
        return addPointerEvent(doc, "keydown", (event) => {
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
        ctx.doc = preserve(evt.doc)
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
