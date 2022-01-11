import { choose, createMachine, guards, ref } from "@ui-machines/core"
import {
  contains,
  getPlacement,
  nextTick,
  preventBodyPointerEvents,
  preventBodyScroll,
  raf,
  trackPointerDown,
} from "@ui-machines/dom-utils"
import { next } from "@ui-machines/utils"
import { hideOthers } from "aria-hidden"
import { createFocusTrap, FocusTrap } from "focus-trap"
import { dom } from "./popover.dom"
import { MachineContext, MachineState } from "./popover.types"

const { and, not, or } = guards

export const machine = createMachine<MachineContext, MachineState>(
  {
    id: "popover-machine",
    initial: "unknown",
    context: {
      referenceExists: false,
      uid: "popover",
      closeOnBlur: true,
      closeOnEsc: true,
      autoFocus: true,
      modal: false,
    },

    computed: {
      __portalled: (ctx) => !!ctx.modal || !!ctx.portalled,
    },

    states: {
      unknown: {
        on: {
          SETUP: {
            target: "closed",
            actions: ["setupDocument", "checkIfReferenceExists"],
          },
        },
      },

      closed: {
        entry: ["clearPointerDown", "invokeOnClose"],
        on: {
          TRIGGER_CLICK: "open",
          OPEN: "open",
        },
      },

      open: {
        activities: [
          "trackPointerDown",
          "trapFocus",
          "preventScroll",
          "hideContentBelow",
          "disableOutsidePointerEvents",
          "positionContent",
        ],
        entry: choose([
          {
            guard: and("autoFocus", not("modal")),
            actions: ["setInitialFocus", "invokeOnOpen"],
          },
          {
            guard: not("modal"),
            actions: ["focusContent", "invokeOnOpen"],
          },
          { actions: ["invokeOnOpen"] },
        ]),
        on: {
          CLOSE: {
            target: "closed",
            actions: "focusTrigger",
          },
          TRIGGER_CLICK: {
            target: "closed",
            actions: "focusTrigger",
          },
          ESCAPE: {
            guard: "closeOnEsc",
            target: "closed",
            actions: "focusTrigger",
          },
          TAB: {
            guard: and("isLastTabbableElement", "closeOnBlur", "portalled"),
            target: "closed",
            actions: "focusNextTabbableElementAfterTrigger",
          },
          SHIFT_TAB: {
            guard: and(or("isFirstTabbableElement", "isContentFocused"), "closeOnBlur", "portalled"),
            target: "closed",
            actions: "focusTrigger",
          },
          INTERACT_OUTSIDE: [
            {
              guard: and("closeOnBlur", "isRelatedTargetFocusable"),
              target: "closed",
            },
            {
              guard: "closeOnBlur",
              target: "closed",
              actions: "focusTrigger",
            },
          ],
        },
      },
    },
  },
  {
    activities: {
      positionContent(ctx) {
        let cleanup = () => {}
        raf(() => {
          const ref = ctx.referenceExists ? dom.getReferenceEl(ctx) : dom.getTriggerEl(ctx)
          const utils = getPlacement(ref, dom.getContentEl(ctx), {
            placement: "bottom",
          })
          utils.compute()
          cleanup = utils.addListeners()
        })
        return cleanup
      },
      trackPointerDown(ctx) {
        return trackPointerDown(dom.getDoc(ctx), (el) => {
          ctx.pointerdownNode = ref(el)
        })
      },
      disableOutsidePointerEvents(ctx) {
        const el = dom.getContentEl(ctx)
        return preventBodyPointerEvents(el, {
          document: dom.getDoc(ctx),
          disabled: !ctx.modal,
        })
      },
      hideContentBelow(ctx) {
        if (!ctx.modal) return
        let unhide: VoidFunction
        nextTick(() => {
          const el = dom.getContentEl(ctx)
          if (!el) return
          try {
            unhide = hideOthers(el)
          } catch {}
        })
        return () => unhide?.()
      },
      preventScroll(ctx) {
        return preventBodyScroll({
          allowPinchZoom: true,
          disabled: !ctx.modal,
          document: dom.getDoc(ctx),
        })
      },
      trapFocus(ctx) {
        if (!ctx.modal) return
        let trap: FocusTrap
        nextTick(() => {
          const el = dom.getContentEl(ctx)
          if (!el) return
          trap = createFocusTrap(el, {
            escapeDeactivates: false,
            allowOutsideClick: true,
            returnFocusOnDeactivate: true,
            document: dom.getDoc(ctx),
            fallbackFocus: el,
            initialFocus: ctx.initialFocusEl,
          })
          try {
            trap.activate()
          } catch {}
        })
        return () => trap?.deactivate()
      },
    },
    guards: {
      closeOnEsc: (ctx) => !!ctx.closeOnEsc,
      autoFocus: (ctx) => !!ctx.autoFocus,
      modal: (ctx) => !!ctx.modal,
      portalled: (ctx) => !!ctx.portalled,
      isRelatedTargetFocusable: (_ctx, evt) => evt.focusable,
      closeOnBlur: (ctx) => !!ctx.closeOnBlur,
      isContentFocused: (ctx) => dom.getContentEl(ctx) === dom.getActiveEl(ctx),
      isFirstTabbableElement: (ctx) => dom.getFirstTabbableEl(ctx) === dom.getActiveEl(ctx),
      isLastTabbableElement: (ctx) => dom.getLastTabbableEl(ctx) === dom.getActiveEl(ctx),
    },
    actions: {
      checkIfReferenceExists(ctx) {
        raf(() => {
          const el = dom.getReferenceEl(ctx)
          ctx.referenceExists = !!el
        })
      },
      setupDocument(ctx, evt) {
        ctx.doc = ref(evt.doc)
        ctx.uid = evt.id
      },
      clearPointerDown(ctx) {
        ctx.pointerdownNode = null
      },
      focusContent(ctx) {
        nextTick(() => {
          dom.getContentEl(ctx)?.focus()
        })
      },
      setInitialFocus(ctx) {
        nextTick(() => {
          dom.getInitialFocusEl(ctx)?.focus()
        })
      },
      focusTrigger(ctx) {
        nextTick(() => {
          dom.getTriggerEl(ctx)?.focus()
        })
      },
      invokeOnOpen(ctx, evt) {
        if (evt.type !== "SETUP") {
          ctx.onOpen?.()
        }
      },
      invokeOnClose(ctx, evt) {
        if (evt.type !== "SETUP") {
          ctx.onClose?.()
        }
      },
      focusNextTabbableElementAfterTrigger(ctx, evt) {
        const content = dom.getContentEl(ctx)
        const doc = dom.getDoc(ctx)
        const button = dom.getTriggerEl(ctx)
        if (!content || !button) return

        const lastTabbable = dom.getLastTabbableEl(ctx)
        if (lastTabbable !== doc.activeElement) return

        let tabbables = dom.getDocTabbableEls(ctx)
        let elementAfterTrigger = next(tabbables, tabbables.indexOf(button), { loop: false })

        // content is just after button (in dom order) ???
        if (elementAfterTrigger === content) {
          tabbables = tabbables.filter((el) => !contains(content, el))
          elementAfterTrigger = next(tabbables, tabbables.indexOf(button), { loop: false })
        }

        // if there's no next element, let the browser handle it
        if (!elementAfterTrigger || elementAfterTrigger === button) return

        // else focus the next element
        evt.preventDefault()
        nextTick(() => elementAfterTrigger?.focus())
      },
    },
  },
)
