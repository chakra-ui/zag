import { createMachine, guards, ref, subscribe } from "@zag-js/core"
import { addDomEvent, nextTick, preventBodyScroll, trackPointerDown } from "@zag-js/dom-utils"
import { runIfFn } from "@zag-js/utils"
import { hideOthers } from "aria-hidden"
import { createFocusTrap, FocusTrap } from "focus-trap"
import { dom } from "./dialog.dom"
import { store } from "./dialog.store"
import { MachineContext, MachineState } from "./dialog.types"

const { and } = guards

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "dialog",
    initial: "unknown",
    context: {
      pointerdownNode: null,
      role: "dialog",
      isTitleRendered: true,
      isDescriptionRendered: true,
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
            actions: "setupDocument",
          },
        },
      },
      open: {
        entry: ["checkRenderedElements"],
        activities: [
          "trapFocus",
          "preventScroll",
          "hideContentBelow",
          "subscribeToStore",
          "trackEscKey",
          "trackPointerDown",
        ],
        on: {
          CLOSE: "closed",
          TRIGGER_CLICK: "closed",
          UNDERLAY_CLICK: {
            guard: and("isTopMostDialog", "closeOnOutsideClick", "isValidUnderlayClick"),
            target: "closed",
            actions: ["invokeOnOutsideClick"],
          },
        },
      },
      closed: {
        entry: ["invokeOnClose", "clearPointerdownNode"],
        on: {
          OPEN: "open",
          TRIGGER_CLICK: "open",
        },
      },
    },
  },
  {
    guards: {
      isTopMostDialog: (ctx) => ctx.isTopMostDialog,
      closeOnOutsideClick: (ctx) => ctx.closeOnOutsideClick,
      isValidUnderlayClick: (ctx, evt) => evt.target === ctx.pointerdownNode,
    },
    activities: {
      trackPointerDown(ctx, _evt) {
        return trackPointerDown(dom.getDoc(ctx), (el) => {
          ctx.pointerdownNode = ref(el)
        })
      },
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
            initialFocus: runIfFn(ctx.initialFocusEl),
            setReturnFocus: runIfFn(ctx.finalFocusEl),
          })
          try {
            trap.activate()
          } catch {}
        })
        return () => trap?.deactivate()
      },
      subscribeToStore(ctx, _evt, { send }) {
        const register = { id: ctx.uid, close: () => send("CLOSE") }
        store.add(register)
        ctx.isTopMostDialog = store.isTopMost(ctx.uid)
        const unsubscribe = subscribe(store, () => {
          ctx.isTopMostDialog = store.isTopMost(ctx.uid)
        })
        return () => {
          unsubscribe()
          store.remove(ctx.uid)
        }
      },
      hideContentBelow(ctx) {
        let unhide: VoidFunction
        nextTick(() => {
          const el = dom.getUnderlayEl(ctx)
          try {
            unhide = hideOthers(el)
          } catch {}
        })
        return () => unhide?.()
      },
    },
    actions: {
      setupDocument(ctx, evt) {
        if (evt.doc) ctx.doc = ref(evt.doc)
        ctx.uid = evt.id
      },
      checkRenderedElements(ctx) {
        nextTick(() => {
          ctx.isTitleRendered = !!dom.getTitleEl(ctx)
          ctx.isDescriptionRendered = !!dom.getDescriptionEl(ctx)
        })
      },
      invokeOnOutsideClick(ctx) {
        ctx.onOutsideClick?.()
      },
      invokeOnClose(ctx) {
        ctx.onClose?.()
      },
      clearPointerdownNode(ctx) {
        ctx.pointerdownNode = null
      },
    },
  },
)
