import { choose, createMachine, guards, ref } from "@ui-machines/core"
import { createFocusTrap, FocusTrap } from "focus-trap"
import { contains } from "tiny-dom-query"
import { isTabbable } from "tiny-dom-query/tabbable"
import { nextTick, noop } from "tiny-fn"
import { next } from "../utils/array"
import { preventBodyScroll } from "../utils/body-scroll-lock"
import { trackPointerDown } from "../utils/pointer-event"
import { Context } from "../utils/types"
import { dom } from "./popover.dom"

const { and, or, not } = guards

export type PopoverMachineContext = Context<{
  modal?: boolean
  autoFocus?: boolean
  initialFocusEl?: HTMLElement | (() => HTMLElement)
  closeOnBlur?: boolean
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
      closeOnBlur: true,
      closeOnEsc: true,
      autoFocus: true,
      modal: false,
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
          TRIGGER_CLICK: "open",
          OPEN: "open",
        },
      },
      open: {
        activities: ["trackPointerDown", "trapFocus", "preventScroll"],
        entry: choose([
          {
            cond: and("autoFocus", not("modal")),
            actions: "setInitialFocus",
          },
          {
            cond: not("modal"),
            actions: "focusContent",
          },
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
            cond: "closeOnEsc",
            target: "closed",
            actions: "focusTrigger",
          },
          TAB: {
            cond: and("isLastTabbableElement", "closeOnBlur"),
            target: "closed",
            actions: "focusNextTabbableElementAfterTrigger",
          },
          SHIFT_TAB: {
            cond: or("isFirstTabbableElement", "isContentFocused", "closeOnBlur"),
            target: "closed",
            actions: "focusTrigger",
          },
          CLICK_OUTSIDE: [
            {
              cond: and("closeOnBlur", "isRelatedTargetFocusable"),
              target: "closed",
            },
            {
              cond: "closeOnBlur",
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
      trackPointerDown,
      preventScroll(ctx) {
        return preventBodyScroll({
          allowPinchZoom: true,
          disabled: !ctx.modal,
          document: dom.getDoc(ctx),
        })
      },
      trapFocus(ctx) {
        let trap: FocusTrap
        nextTick(() => {
          const el = dom.getContentEl(ctx)
          if (!ctx.modal || !el) return noop
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
      isRelatedTargetFocusable: (ctx) => {
        if (!ctx.pointerdownNode) return false
        return isTabbable(ctx.pointerdownNode)
      },
      closeOnBlur: (ctx) => !!ctx.closeOnBlur,
      isContentFocused: (ctx) => dom.getContentEl(ctx) === dom.getDoc(ctx).activeElement,
      isFirstTabbableElement: (ctx) => {
        const first = dom.getFirstTabbableEl(ctx)
        return first === dom.getDoc(ctx).activeElement
      },
      isLastTabbableElement: (ctx) => {
        const lastEl = dom.getLastTabbableEl(ctx)
        return lastEl === dom.getDoc(ctx).activeElement
      },
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
      focusNextTabbableElementAfterTrigger(ctx, evt) {
        const content = dom.getContentEl(ctx)
        const doc = dom.getDoc(ctx)
        const button = dom.getTriggerEl(ctx)
        if (!content || !button) return

        const lastTabbable = dom.getLastTabbableEl(ctx)
        if (lastTabbable !== doc.activeElement) return

        let tabbables = dom.getDocTabbableEls(ctx)
        let nextEl = next(tabbables, tabbables.indexOf(button), { loop: false })

        // content is just after button (in dom order)
        if (nextEl === content) {
          tabbables = tabbables.filter((el) => !contains(content, el))
          nextEl = next(tabbables, tabbables.indexOf(button), { loop: false })
        }

        // if there's no next element, let the browser handle it
        if (!nextEl || nextEl === button) return

        // else focus the next element
        evt.preventDefault()
        nextTick(() => nextEl?.focus())
      },
    },
  },
)
