import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { nextTick, raf } from "@zag-js/dom-query"
import { getPlacement } from "@zag-js/popper"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import { proxyTabFocus } from "@zag-js/tabbable"
import { compact, runIfFn } from "@zag-js/utils"
import { createFocusTrap, FocusTrap } from "focus-trap"
import { dom } from "./popover.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./popover.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "popover",
      initial: ctx.open ? "open" : "closed",
      context: {
        closeOnInteractOutside: true,
        closeOnEsc: true,
        autoFocus: true,
        modal: false,
        positioning: {
          placement: "bottom",
          ...ctx.positioning,
        },
        currentPlacement: undefined,
        ...ctx,
        focusTriggerOnClose: true,
        renderedElements: {
          title: true,
          description: true,
        },
      },

      computed: {
        currentPortalled: (ctx) => !!ctx.modal || !!ctx.portalled,
      },

      watch: {
        open: ["toggleVisibility"],
      },

      entry: ["checkRenderedElements"],

      states: {
        closed: {
          entry: "invokeOnClose",
          on: {
            TOGGLE: "open",
            OPEN: "open",
          },
        },

        open: {
          activities: [
            "trapFocus",
            "preventScroll",
            "hideContentBelow",
            "trackPositioning",
            "trackDismissableElement",
            "proxyTabFocus",
          ],
          entry: ["setInitialFocus", "invokeOnOpen"],
          on: {
            CLOSE: "closed",
            REQUEST_CLOSE: {
              target: "closed",
              actions: "focusTriggerIfNeeded",
            },
            TOGGLE: "closed",
            SET_POSITIONING: {
              actions: "setPositioning",
            },
          },
        },
      },
    },
    {
      activities: {
        trackPositioning(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          const anchorEl = dom.getAnchorEl(ctx) ?? dom.getTriggerEl(ctx)
          return getPlacement(anchorEl, dom.getPositionerEl(ctx), {
            ...ctx.positioning,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
            onCleanup() {
              ctx.currentPlacement = undefined
            },
          })
        },
        trackDismissableElement(ctx, _evt, { send }) {
          return trackDismissableElement(dom.getContentEl(ctx), {
            pointerBlocking: ctx.modal,
            exclude: dom.getTriggerEl(ctx),
            onEscapeKeyDown(event) {
              ctx.onEscapeKeyDown?.(event)
              if (ctx.closeOnEsc) return
              ctx.focusTriggerOnClose = true
              event.preventDefault()
            },
            onInteractOutside(event) {
              ctx.onInteractOutside?.(event)
              if (event.defaultPrevented) return
              ctx.focusTriggerOnClose = !(event.detail.focusable || event.detail.contextmenu)
              if (!ctx.closeOnInteractOutside) {
                event.preventDefault()
              }
            },
            onPointerDownOutside(event) {
              ctx.onPointerDownOutside?.(event)
            },
            onFocusOutside(event) {
              ctx.onFocusOutside?.(event)
            },
            onDismiss() {
              send({ type: "REQUEST_CLOSE", src: "#interact-outside" })
            },
          })
        },
        proxyTabFocus(ctx) {
          if (ctx.modal || !ctx.portalled) return
          return proxyTabFocus(dom.getContentEl(ctx), dom.getTriggerEl(ctx), (el) => {
            el.focus({ preventScroll: true })
          })
        },
        hideContentBelow(ctx) {
          if (!ctx.modal) return
          let cleanup: VoidFunction | undefined
          nextTick(() => {
            cleanup = ariaHidden([dom.getContentEl(ctx), dom.getTriggerEl(ctx)])
          })
          return () => cleanup?.()
        },
        preventScroll(ctx) {
          if (!ctx.modal) return
          return preventBodyScroll(dom.getDoc(ctx))
        },
        trapFocus(ctx) {
          if (!ctx.modal) return
          let trap: FocusTrap | undefined
          nextTick(() => {
            const el = dom.getContentEl(ctx)
            if (!el) return
            trap = createFocusTrap(el, {
              escapeDeactivates: false,
              allowOutsideClick: true,
              returnFocusOnDeactivate: true,
              document: dom.getDoc(ctx),
              fallbackFocus: el,
              initialFocus: runIfFn(ctx.initialFocusEl),
            })
            try {
              trap.activate()
            } catch {}
          })
          return () => trap?.deactivate()
        },
      },
      actions: {
        setPositioning(ctx, evt) {
          raf(() => {
            const anchorEl = dom.getAnchorEl(ctx) ?? dom.getTriggerEl(ctx)
            getPlacement(anchorEl, dom.getPositionerEl(ctx), {
              ...ctx.positioning,
              ...evt.options,
              listeners: false,
            })
          })
        },
        checkRenderedElements(ctx) {
          raf(() => {
            Object.assign(ctx.renderedElements, {
              title: !!dom.getTitleEl(ctx),
              description: !!dom.getDescriptionEl(ctx),
            })
          })
        },
        setInitialFocus(ctx) {
          raf(() => {
            dom.getInitialFocusEl(ctx)?.focus()
          })
        },
        focusTriggerIfNeeded(ctx) {
          if (!ctx.focusTriggerOnClose) return
          raf(() => dom.getTriggerEl(ctx)?.focus())
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.(true)
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.(false)
        },
        toggleVisibility(ctx, _evt, { send }) {
          send({ type: ctx.open ? "OPEN" : "CLOSE", src: "controlled" })
        },
      },
    },
  )
}
