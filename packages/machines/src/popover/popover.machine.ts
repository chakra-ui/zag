import {
  createMachine,
  guards,
  preserve,
  trackPointerDown,
} from "@ui-machines/core"
import { DOMHelper, nextTick } from "@ui-machines/utils"
import { WithDOM } from "../type-utils"
import { dom, getElements } from "./popover.dom"

const { and } = guards

export type PopoverMachineContext = WithDOM<{
  autoFocus?: boolean
  autoFocusNode?: HTMLElement
  restoreFocus?: boolean
  closeOnOutsideClick?: boolean
  closeOnEsc?: boolean
  onOpen?: () => void
  onClose?: () => void
}>

export type PopoverMachineState = {
  value: "mounted" | "open" | "closed"
}

export const popoverMachine = createMachine<
  PopoverMachineContext,
  PopoverMachineState
>(
  {
    id: "popover-machine",
    initial: "mounted",
    context: {
      uid: "01",
      closeOnOutsideClick: true,
      closeOnEsc: true,
      restoreFocus: true,
      autoFocus: true,
    },
    states: {
      mounted: {
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
              cond: and("shouldCloseOnOutsideClick", "isPointerdownFocusable"),
              target: "closed",
            },
            {
              cond: "shouldCloseOnOutsideClick",
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
      isPointerdownFocusable: (ctx) =>
        new DOMHelper(ctx.pointerdownNode).isTabbable,
      shouldCloseOnOutsideClick: (ctx) => !!ctx.closeOnOutsideClick,
    },
    actions: {
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = preserve(evt.doc)
      },
      clearPointerDown(ctx) {
        ctx.pointerdownNode = null
      },
      autoFocus(ctx) {
        nextTick(() => {
          const { getFirstFocusable } = dom(ctx)
          const firstFocusable = getFirstFocusable()
          firstFocusable?.focus()
        })
      },
      restoreFocus(ctx) {
        nextTick(() => {
          const { trigger } = getElements(ctx)
          trigger?.focus()
        })
      },
    },
  },
)
