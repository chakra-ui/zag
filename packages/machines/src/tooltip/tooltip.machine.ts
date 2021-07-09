import { createMachine, preserve } from "@ui-machines/core"
import { addEventListener } from "@ui-machines/utils/event-utils"
import { proxy } from "valtio"

export const tooltipStore = proxy<{ id: string | null }>({ id: null })

export type TooltipMachineContext = {
  doc?: Document
  id: string
}

export type TooltipMachineState = {
  value: "idle" | "opening" | "open" | "closing" | "closed"
}

export const tooltipMachine = createMachine<
  TooltipMachineContext,
  TooltipMachineState
>(
  {
    id: "tooltip",
    initial: "idle",
    states: {
      idle: {
        on: {
          MOUNT: {
            actions: "setOwnerDocument",
          },
          POINTER_ENTER: [
            { cond: "noVisibleTooltip", target: "opening" },
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
        },
      },
      open: {
        activities: ["attachEscapeKeyListener"],
        entry: "setGlobalId",
        on: {
          POINTER_LEAVE: [
            { cond: "isVisible", target: "closing" },
            { target: "closed" },
          ],
          // POINTER_DOWN: "closed",
          ESCAPE: "closed",
        },
      },
      closing: {
        after: {
          CLOSE_DELAY: "closed",
        },
        on: {
          FORCE_CLOSE: "closed",
        },
      },
      closed: {
        entry: "resetGlobalId",
        on: {
          POINTER_ENTER: [
            { cond: "noVisibleTooltip", target: "opening" },
            { target: "open" },
          ],
        },
      },
    },
  },
  {
    activities: {
      attachEscapeKeyListener: (ctx, evt, { send }) => {
        const doc = ctx.doc ?? document
        return addEventListener(doc, "keydown", (event) => {
          if (event.key === "Escape") {
            send("ESCAPE")
          }
        })
      },
    },
    actions: {
      setOwnerDocument: (ctx, evt) => {
        ctx.doc = preserve(evt.doc)
      },
      setGlobalId: (ctx) => {
        tooltipStore.id = ctx.id
      },
      resetGlobalId: (ctx) => {
        if (ctx.id === tooltipStore.id) {
          tooltipStore.id = null
        }
      },
    },
    guards: {
      noVisibleTooltip: () => tooltipStore.id === null,
      isVisible: (ctx) => ctx.id === tooltipStore.id,
    },
    delays: {
      OPEN_DELAY: 250,
      CLOSE_DELAY: 500,
    },
  },
)
