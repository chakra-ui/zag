import { createMachine, guards, ref, subscribe } from "@zag-js/core"
import { addDomEvent, nextTick, trackPointerDown } from "@zag-js/dom-utils"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import { runIfFn } from "@zag-js/utils"
import { ariaHidden } from "@zag-js/aria-hidden"
import { createFocusTrap, FocusTrap } from "focus-trap"
import { dom } from "./dialog.dom"
import { store } from "./dialog.store"
import type { MachineContext, MachineState, UserDefinedContext } from "./dialog.types"

const { and } = guards

export function machine(ctx: UserDefinedContext = {}) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "dialog",
      initial: "unknown",
      context: {
        pointerdownNode: null,
        role: "dialog",
        isTitleRendered: true,
        isDescriptionRendered: true,
        uid: "",
        trapFocus: true,
        preventScroll: true,
        isTopMostDialog: true,
        closeOnOutsideClick: true,
        closeOnEsc: true,
        restoreFocus: true,
        ...ctx,
      },
      states: {
        unknown: {
          on: {
            SETUP: [
              {
                guard: "isOpen",
                target: "open",
                actions: "setupDocument",
              },
              {
                target: "closed",
                actions: "setupDocument",
              },
            ],
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
        isOpen: (ctx) => !!ctx.open,
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
          let unhide: VoidFunction | undefined
          nextTick(() => {
            unhide = ariaHidden([dom.getUnderlayEl(ctx)])
          })
          return () => unhide?.()
        },
      },
      actions: {
        setupDocument(ctx, evt) {
          if (evt.doc) ctx.doc = ref(evt.doc)
          if (evt.root) ctx.rootNode = ref(evt.root)
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
}
