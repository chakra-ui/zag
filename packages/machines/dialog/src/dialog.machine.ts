import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { nextTick } from "@zag-js/dom-utils"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import { runIfFn } from "@zag-js/utils"
import { createFocusTrap, FocusTrap } from "focus-trap"
import { dom } from "./dialog.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./dialog.types"

export function machine(ctx: UserDefinedContext) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "dialog",
      initial: "unknown",
      context: {
        pointerdownNode: null,
        role: "dialog",
        renderedElements: {
          title: true,
          description: true,
        },
        modal: true,
        trapFocus: true,
        preventScroll: true,
        closeOnOutsideClick: true,
        closeOnEsc: true,
        restoreFocus: true,
        ...ctx,
      },
      states: {
        unknown: {
          on: {
            SETUP: ctx.defaultOpen ? "open" : "closed",
          },
        },
        open: {
          entry: ["checkRenderedElements"],
          activities: ["trackDismissableElement", "trapFocus", "preventScroll", "hideContentBelow"],
          on: {
            CLOSE: "closed",
            TOGGLE: "closed",
          },
        },
        closed: {
          entry: ["invokeOnClose"],
          on: {
            OPEN: "open",
            TOGGLE: "open",
          },
        },
      },
    },
    {
      activities: {
        trackDismissableElement(ctx, _evt, { send }) {
          let cleanup: VoidFunction | undefined
          nextTick(() => {
            cleanup = trackDismissableElement(dom.getContentEl(ctx), {
              pointerBlocking: ctx.modal,
              exclude: [dom.getTriggerEl(ctx)],
              onDismiss: () => send({ type: "CLOSE", src: "interact-outside" }),
              onEscapeKeyDown(event) {
                if (!ctx.closeOnEsc) {
                  event.preventDefault()
                } else {
                  send({ type: "CLOSE", src: "escape-key" })
                }
                ctx.onEsc?.()
              },
              onPointerDownOutside(event) {
                if (!ctx.closeOnOutsideClick) {
                  event.preventDefault()
                }
                ctx.onOutsideClick?.()
              },
            })
          })
          return () => cleanup?.()
        },
        preventScroll(ctx) {
          if (!ctx.preventScroll) return
          return preventBodyScroll(dom.getDoc(ctx))
        },
        trapFocus(ctx) {
          if (!ctx.trapFocus) return
          let trap: FocusTrap
          nextTick(() => {
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
        hideContentBelow(ctx) {
          if (!ctx.modal) return
          let cleanup: VoidFunction | undefined
          nextTick(() => {
            cleanup = ariaHidden([dom.getUnderlayEl(ctx)])
          })
          return () => cleanup?.()
        },
      },
      actions: {
        checkRenderedElements(ctx) {
          nextTick(() => {
            Object.assign(ctx, {
              renderedElements: {
                title: !!dom.getTitleEl(ctx),
                description: !!dom.getDescriptionEl(ctx),
              },
            })
          })
        },
        invokeOnClose(ctx) {
          ctx.onClose?.()
        },
      },
    },
  )
}
