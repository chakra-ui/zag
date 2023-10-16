import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { nextTick, raf } from "@zag-js/dom-query"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import { compact, runIfFn } from "@zag-js/utils"
import { createFocusTrap, type FocusTrap } from "focus-trap"
import { dom } from "./dialog.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./dialog.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "dialog",
      initial: ctx.open ? "open" : "closed",

      context: {
        role: "dialog",
        renderedElements: {
          title: true,
          description: true,
        },
        modal: true,
        trapFocus: true,
        preventScroll: true,
        closeOnInteractOutside: true,
        closeOnEscapeKeyDown: true,
        restoreFocus: true,
        ...ctx,
      },

      watch: {
        open: ["toggleVisibility"],
      },

      states: {
        open: {
          entry: ["checkRenderedElements"],
          activities: ["trackDismissableElement", "trapFocus", "preventScroll", "hideContentBelow"],
          on: {
            CLOSE: {
              target: "closed",
              actions: ["invokeOnClose", "restoreFocus"],
            },
            TOGGLE: {
              target: "closed",
              actions: ["invokeOnClose", "restoreFocus"],
            },
          },
        },
        closed: {
          on: {
            OPEN: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
            TOGGLE: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
          },
        },
      },
    },
    {
      activities: {
        trackDismissableElement(ctx, _evt, { send }) {
          const getContentEl = () => dom.getContentEl(ctx)
          return trackDismissableElement(getContentEl, {
            defer: true,
            pointerBlocking: ctx.modal,
            exclude: [dom.getTriggerEl(ctx)],
            onEscapeKeyDown(event) {
              if (!ctx.closeOnEscapeKeyDown) event.preventDefault()
              else send({ type: "CLOSE", src: "escape-key" })
              ctx.onEscapeKeyDown?.(event)
            },
            onPointerDownOutside(event) {
              if (!ctx.closeOnInteractOutside) event.preventDefault()
              ctx.onPointerDownOutside?.(event)
            },
            onFocusOutside(event) {
              if (!ctx.closeOnInteractOutside) event.preventDefault()
              ctx.onFocusOutside?.(event)
            },
            onDismiss() {
              send({ type: "CLOSE", src: "interact-outside" })
            },
          })
        },
        preventScroll(ctx) {
          if (!ctx.preventScroll) return
          return preventBodyScroll(dom.getDoc(ctx))
        },
        trapFocus(ctx) {
          if (!ctx.trapFocus || !ctx.modal) return
          let trap: FocusTrap
          nextTick(() => {
            const contentEl = dom.getContentEl(ctx)
            if (!contentEl) return
            trap = createFocusTrap(contentEl, {
              document: dom.getDoc(ctx),
              escapeDeactivates: false,
              preventScroll: true,
              returnFocusOnDeactivate: false,
              fallbackFocus: contentEl,
              allowOutsideClick: true,
              initialFocus: runIfFn(ctx.initialFocusEl),
            })
            try {
              trap.activate()
            } catch {}
          })
          return () => trap?.deactivate()
        },
        hideContentBelow(ctx) {
          if (!ctx.modal) return
          const getElements = () => [dom.getContentEl(ctx)]
          return ariaHidden(getElements, { defer: true })
        },
      },
      actions: {
        checkRenderedElements(ctx) {
          raf(() => {
            ctx.renderedElements.title = !!dom.getTitleEl(ctx)
            ctx.renderedElements.description = !!dom.getDescriptionEl(ctx)
          })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        toggleVisibility(ctx, _evt, { send }) {
          send({ type: ctx.open ? "OPEN" : "CLOSE", src: "controlled" })
        },
        restoreFocus(ctx) {
          if (!ctx.restoreFocus) return
          raf(() => {
            const el = runIfFn(ctx.finalFocusEl) ?? dom.getTriggerEl(ctx)
            el?.focus({ preventScroll: true })
          })
        },
      },
    },
  )
}
