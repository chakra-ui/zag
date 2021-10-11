import { createMachine, guards, ref } from "@ui-machines/core"
import { isTabbable } from "tiny-dom-query/tabbable"
import { nextTick } from "tiny-fn"
import { trackPointerDown } from "../utils/pointer-down"
import { Context } from "../utils/types"
import { dom } from "./popover.dom"

const { and } = guards

export type PopoverMachineContext = Context<{
  autoFocus?: boolean
  initialFocusEl?: HTMLElement
  restoreFocus?: boolean
  closeOnOutsideClick?: boolean
  closeOnEsc?: boolean
  onOpen?: () => void
  onClose?: () => void
}>

export type PopoverMachineState = {
  value: "unknown" | "open" | "closed"
}

export const popoverMachine = createMachine<PopoverMachineContext, PopoverMachineState>(
  {
    id: "popover-machine",
    initial: "unknown",
    context: {
      uid: "popover",
      closeOnOutsideClick: true,
      closeOnEsc: true,
      restoreFocus: true,
      autoFocus: true,
    },
    states: {
      unknown: {
        on: {
          SETUP: {
            target: "closed",
            actions: ["setId", "setOwnerDocument"],
          },
        },
      },
      closed: {
        entry: "clearPointerDown",
        on: {
          CLICK: "open",
        },
      },
      open: {
        activities: "trackPointerDown",
        entry: "autoFocus",
        on: {
          CLICK: {
            target: "closed",
            actions: "restoreFocus",
          },
          TRANSITION_END: {
            actions: "autoFocus",
          },
          ESCAPE: {
            cond: "shouldCloseOnEsc",
            target: "closed",
            actions: "restoreFocus",
          },
          CLICK_OUTSIDE: [
            {
              cond: and("closeOnOutsideClick", "isRelatedTargetFocusable"),
              target: "closed",
            },
            {
              cond: "closeOnOutsideClick",
              target: "closed",
              actions: "restoreFocus",
            },
          ],
        },
      },
    },
  },
  {
    activities: { trackPointerDown },
    guards: {
      shouldCloseOnEsc: (ctx) => !!ctx.closeOnEsc,
      isRelatedTargetFocusable: (ctx) => {
        if (!ctx.pointerdownNode) return false
        return isTabbable(ctx.pointerdownNode)
      },
      closeOnOutsideClick: (ctx) => !!ctx.closeOnOutsideClick,
    },
    actions: {
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
      },
      clearPointerDown(ctx) {
        ctx.pointerdownNode = null
      },
      autoFocus(ctx) {
        nextTick(() => {
          const el = ctx.initialFocusEl || dom.getFirstFocusableEl(ctx)
          el?.focus()
        })
      },
      restoreFocus(ctx) {
        nextTick(() => {
          dom.getTriggerEl(ctx)?.focus()
        })
      },
    },
  },
)
