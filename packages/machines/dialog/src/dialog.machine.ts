import { createMachine, ref, subscribe } from "@ui-machines/core"
import { addDomEvent, nextTick, preventBodyScroll } from "@ui-machines/dom-utils"
import { Context } from "@ui-machines/types"
import { hideOthers } from "aria-hidden"
import { createFocusTrap, FocusTrap } from "focus-trap"
import { dom } from "./dialog.dom"
import { dialogStore } from "./dialog.store"

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
  closeOnOverlayClick: boolean
  closeOnEsc: boolean
  "aria-label"?: string
  role: "dialog" | "alertdialog"
}>

export type DialogMachineState = {
  value: "unknown" | "open" | "closed"
}

export const dialogMachine = createMachine<DialogMachineContext, DialogMachineState>(
  {
    id: "dialog",
    initial: "unknown",
    context: {
      role: "dialog",
      hasDescription: true,
      hasTitle: true,
      uid: "234",
      trapFocus: true,
      preventScroll: true,
      isTopMostDialog: true,
      closeOnOverlayClick: true,
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
        entry: ["checkTitleAndDescription"],
        activities: ["trapFocus", "preventScroll", "hideContentBelow", "subscribeToStore", "trackEscKey"],
        on: {
          CLOSE: "closed",
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
          if (ctx.closeOnEsc && e.key === "Escape" && ctx.isTopMostDialog) {
            ctx.onEsc?.()
            send("CLOSE")
          }
        })
      },
      preventScroll(ctx) {
        return preventBodyScroll({
          allowPinchZoom: true,
          disabled: !ctx.preventScroll,
          document: dom.getDoc(ctx),
        })
      },
      trapFocus(ctx) {
        let trap: FocusTrap
        nextTick(() => {
          if (!ctx.isTopMostDialog || !ctx.trapFocus) return
          const el = dom.getContentEl(ctx)
          trap = createFocusTrap(el, {
            document: dom.getDoc(ctx),
            escapeDeactivates: false,
            fallbackFocus: dom.getContentEl(ctx),
            allowOutsideClick: true,
            returnFocusOnDeactivate: ctx.restoreFocus,
            initialFocus: ctx.initialFocusEl,
            setReturnFocus: ctx.finalFocusEl,
          })
          try {
            trap.activate()
          } catch {}
        })
        return () => trap?.deactivate()
      },
      subscribeToStore(ctx, _evt, { send }) {
        const register = { id: ctx.uid, close: () => send("CLOSE") }
        dialogStore.add(register)
        ctx.isTopMostDialog = dialogStore.isTopMost(ctx.uid)
        const unsubscribe = subscribe(dialogStore, () => {
          ctx.isTopMostDialog = dialogStore.isTopMost(ctx.uid)
        })
        return () => {
          unsubscribe()
          dialogStore.remove(ctx.uid)
        }
      },
      hideContentBelow(ctx) {
        let unhide: VoidFunction
        nextTick(() => {
          const el = dom.getContentEl(ctx)
          try {
            unhide = hideOthers(el)
          } catch {}
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
      checkTitleAndDescription(ctx) {
        nextTick(() => {
          ctx.hasTitle = !!dom.getTitleEl(ctx)
          ctx.hasDescription = !!dom.getDescriptionEl(ctx)
        })
      },
    },
  },
)
