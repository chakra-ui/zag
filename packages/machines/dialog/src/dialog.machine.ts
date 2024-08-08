import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { nextTick, raf } from "@zag-js/dom-query"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import { compact } from "@zag-js/utils"
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
        closeOnEscape: true,
        restoreFocus: true,
        ...ctx,
      },

      created: ["setAlertDialogProps"],

      watch: {
        open: ["toggleVisibility"],
      },

      states: {
        open: {
          entry: ["checkRenderedElements", "syncZIndex"],
          activities: ["trackDismissableElement", "trapFocus", "preventScroll", "hideContentBelow"],
          on: {
            "CONTROLLED.CLOSE": {
              target: "closed",
            },
            CLOSE: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "closed",
                actions: ["invokeOnClose"],
              },
            ],
            TOGGLE: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "closed",
                actions: ["invokeOnClose"],
              },
            ],
          },
        },
        closed: {
          on: {
            "CONTROLLED.OPEN": {
              target: "open",
            },
            OPEN: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["invokeOnOpen"],
              },
            ],
            TOGGLE: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["invokeOnOpen"],
              },
            ],
          },
        },
      },
    },
    {
      guards: {
        isOpenControlled: (ctx) => !!ctx["open.controlled"],
      },
      activities: {
        trackDismissableElement(ctx, _evt, { send }) {
          const getContentEl = () => dom.getContentEl(ctx)
          return trackDismissableElement(getContentEl, {
            defer: true,
            pointerBlocking: ctx.modal,
            exclude: [dom.getTriggerEl(ctx)],
            onInteractOutside(event) {
              ctx.onInteractOutside?.(event)
              if (!ctx.closeOnInteractOutside) {
                event.preventDefault()
              }
            },
            persistentElements: ctx.persistentElements,
            onFocusOutside: ctx.onFocusOutside,
            onPointerDownOutside: ctx.onPointerDownOutside,
            onEscapeKeyDown(event) {
              ctx.onEscapeKeyDown?.(event)
              if (!ctx.closeOnEscape) {
                event.preventDefault()
              }
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

          const cleanup = nextTick(() => {
            const contentEl = dom.getContentEl(ctx)
            if (!contentEl) return
            trap = createFocusTrap(contentEl, {
              document: dom.getDoc(ctx),
              escapeDeactivates: false,
              preventScroll: true,
              fallbackFocus: contentEl,
              returnFocusOnDeactivate: ctx.restoreFocus,
              allowOutsideClick: true,
              initialFocus: ctx.initialFocusEl?.() ?? undefined,
              setReturnFocus(triggerEl) {
                return ctx.finalFocusEl?.() ?? triggerEl
              },
            })

            try {
              trap.activate()
            } catch {}
          })
          return () => {
            trap?.deactivate()
            cleanup()
          }
        },
        hideContentBelow(ctx) {
          if (!ctx.modal) return
          const getElements = () => [dom.getContentEl(ctx)]
          return ariaHidden(getElements, { defer: true })
        },
      },
      actions: {
        setAlertDialogProps(ctx) {
          if (ctx.role !== "alertdialog") return
          ctx.initialFocusEl ||= () => dom.getCloseTriggerEl(ctx)
          ctx.closeOnInteractOutside = false
        },
        checkRenderedElements(ctx) {
          raf(() => {
            ctx.renderedElements.title = !!dom.getTitleEl(ctx)
            ctx.renderedElements.description = !!dom.getDescriptionEl(ctx)
          })
        },
        syncZIndex(ctx) {
          raf(() => {
            // sync z-index of positioner with content
            const contentEl = dom.getContentEl(ctx)
            if (!contentEl) return

            const win = dom.getWin(ctx)
            const styles = win.getComputedStyle(contentEl)

            const elems = [dom.getPositionerEl(ctx), dom.getBackdropEl(ctx)]
            elems.forEach((node) => {
              node?.style.setProperty("--z-index", styles.zIndex)
            })
          })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        toggleVisibility(ctx, evt, { send }) {
          send({ type: ctx.open ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: evt })
        },
      },
    },
  )
}
