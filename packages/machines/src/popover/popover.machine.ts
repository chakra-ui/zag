import {
  createMachine,
  guards,
  preserve,
  trackPointerDown,
} from "@chakra-ui/machine"
import { getFirstFocusable, isTabbable, nextTick } from "@chakra-ui/utilities"
import { WithDOM } from "../type-utils"
import { getElements } from "./popover.dom"

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
  value: "open" | "closed"
}

export const popoverMachine = createMachine<
  PopoverMachineContext,
  PopoverMachineState
>(
  {
    id: "popover-machine",
    initial: "closed",
    context: {
      uid: "01",
      closeOnOutsideClick: true,
      closeOnEsc: true,
      restoreFocus: true,
      autoFocus: true,
    },
    on: {
      MOUNT: {
        actions: ["setId", "setOwnerDocument"],
      },
    },
    states: {
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
      isPointerdownFocusable: (ctx) => isTabbable(ctx.pointerdownNode),
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
          const nodes = getElements(ctx)
          if (!nodes.content) return
          const el = getFirstFocusable(nodes.content) ?? nodes.content
          el.focus()
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
