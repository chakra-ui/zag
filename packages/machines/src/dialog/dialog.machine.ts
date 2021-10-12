import { createMachine, ref } from "@ui-machines/core"
import { hideOthers } from "aria-hidden"
import { createFocusTrap, FocusTrap } from "focus-trap"
import { last, remove } from "tiny-array"
import { addDomEvent } from "tiny-dom-event"
import { nextTick, noop } from "tiny-fn"
import { proxy, subscribe } from "valtio"
import { Context, trackPointerDown } from "../utils"
import { preventScroll } from "../utils/body-scroll-lock"
import { dom } from "./dialog.dom"

export const dialogStore = proxy<{ ids: string[] }>({ ids: [] })

export type DialogMachineContext = Context<{
  hasTitle: boolean
  hasDescription: boolean
  trapFocus: boolean
  preventScroll: boolean
  initialFocusEl?: HTMLElement | (() => HTMLElement)
  finalFocusEl?: HTMLElement | (() => HTMLElement)
  isTopMostDialog: boolean
  restoreFocus?: boolean
  onEsc?: () => void
  onClickOutside?: () => void
  closeOnOutsideClick: boolean
  closeOnEsc: boolean
}>

export type DialogMachineState = {
  value: "unknown" | "open" | "closed"
}

export const dialogMachine = createMachine<DialogMachineContext, DialogMachineState>(
  {
    id: "dialog",
    initial: "unknown",
    context: {
      hasDescription: true,
      hasTitle: true,
      uid: "234",
      trapFocus: true,
      preventScroll: true,
      isTopMostDialog: true,
      closeOnOutsideClick: true,
      closeOnEsc: true,
      restoreFocus: true,
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
      open: {
        entry: ["checkElements"],
        activities: [
          "trapFocus",
          "preventScroll",
          "hideContentBelow",
          "subscribeToStore",
          "trackPointerDown",
          "trackEscKey",
        ],
        on: {
          CLOSE: "closed",
          STACK_CHANGE: {
            actions: ["setIsTopMostDialog"],
          },
        },
      },
      closed: {
        on: {
          OPEN: "open",
        },
      },
    },
  },
  {
    activities: {
      trackEscKey(ctx, _evt, { send }) {
        return addDomEvent(dom.getWin(ctx), "keydown", (e) => {
          if (ctx.closeOnEsc && e.key === "Escape") {
            ctx.onEsc?.()
            send("CLOSE")
          }
        })
      },
      trackPointerDown: trackPointerDown,
      preventScroll(ctx) {
        return preventScroll({
          allowPinZoom: true,
          disabled: !ctx.preventScroll,
          environment: { document: dom.getDoc(ctx), window: dom.getWin(ctx) },
        })
      },
      trapFocus(ctx) {
        if (!ctx.isTopMostDialog || !ctx.trapFocus) return noop
        let trap: FocusTrap
        nextTick(() => {
          const el = dom.getContentEl(ctx)
          trap = createFocusTrap(el, {
            escapeDeactivates: false,
            allowOutsideClick: true,
            returnFocusOnDeactivate: ctx.restoreFocus,
            initialFocus: ctx.initialFocusEl,
            setReturnFocus: ctx.finalFocusEl,
          })
          trap.activate()
        })
        return () => trap?.deactivate()
      },
      subscribeToStore(ctx) {
        dialogStore.ids.push(ctx.uid)
        const unsubscribe = subscribe(dialogStore, () => {
          ctx.isTopMostDialog = last(dialogStore.ids) === ctx.uid
        })
        return () => {
          unsubscribe()
          dialogStore.ids = remove(dialogStore.ids, ctx.uid)
        }
      },
      hideContentBelow(ctx) {
        let unhide: VoidFunction
        nextTick(() => {
          const el = dom.getContentEl(ctx)
          unhide = hideOthers(el)
        })
        return () => unhide?.()
      },
    },
    actions: {
      setId(ctx, evt) {
        ctx.uid = evt.id
      },
      setOwnerDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
      },
      checkElements(ctx) {
        nextTick(() => {
          ctx.hasTitle = !!dom.getTitleEl(ctx)
          ctx.hasDescription = !!dom.getDescriptionEl(ctx)
        })
      },
    },
  },
)
