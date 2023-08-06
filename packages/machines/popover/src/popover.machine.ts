import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { nextTick, raf } from "@zag-js/dom-query"
import { getPlacement } from "@zag-js/popper"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import { proxyTabFocus } from "@zag-js/tabbable"
import { compact, runIfFn } from "@zag-js/utils"
import { createFocusTrap, type FocusTrap } from "focus-trap"
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
        portalled: true,
        positioning: {
          placement: "bottom",
          ...ctx.positioning,
        },
        currentPlacement: undefined,
        ...ctx,
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
          on: {
            TOGGLE: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
            OPEN: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
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
          entry: ["setInitialFocus"],
          on: {
            CLOSE: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
            REQUEST_CLOSE: {
              target: "closed",
              actions: ["restoreFocusIfNeeded", "invokeOnClose"],
            },
            TOGGLE: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
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
          const getPositionerEl = () => dom.getPositionerEl(ctx)
          return getPlacement(anchorEl, getPositionerEl, {
            ...ctx.positioning,
            defer: true,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
            onCleanup() {
              ctx.currentPlacement = undefined
            },
          })
        },
        trackDismissableElement(ctx, _evt, { send }) {
          const getContentEl = () => dom.getContentEl(ctx)
          let restoreFocus = true
          return trackDismissableElement(getContentEl, {
            pointerBlocking: ctx.modal,
            exclude: dom.getTriggerEl(ctx),
            defer: true,
            onEscapeKeyDown(event) {
              ctx.onEscapeKeyDown?.(event)
              if (ctx.closeOnEsc) return
              event.preventDefault()
            },
            onInteractOutside(event) {
              ctx.onInteractOutside?.(event)
              if (event.defaultPrevented) return
              restoreFocus = !(event.detail.focusable || event.detail.contextmenu)
              if (!ctx.closeOnInteractOutside) {
                event.preventDefault()
              }
            },
            onPointerDownOutside: ctx.onPointerDownOutside,
            onFocusOutside: ctx.onFocusOutside,
            onDismiss() {
              send({ type: "REQUEST_CLOSE", src: "interact-outside", restoreFocus })
            },
          })
        },
        proxyTabFocus(ctx) {
          if (ctx.modal || !ctx.portalled) return
          const getContentEl = () => dom.getContentEl(ctx)
          return proxyTabFocus(getContentEl, {
            triggerElement: dom.getTriggerEl(ctx),
            defer: true,
            onFocus(el) {
              el.focus({ preventScroll: true })
            },
          })
        },
        hideContentBelow(ctx) {
          if (!ctx.modal) return
          const getElements = () => [dom.getContentEl(ctx), dom.getTriggerEl(ctx)]
          return ariaHidden(getElements, { defer: true })
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
              preventScroll: true,
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
          const anchorEl = dom.getAnchorEl(ctx) ?? dom.getTriggerEl(ctx)
          const getPositionerEl = () => dom.getPositionerEl(ctx)
          getPlacement(anchorEl, getPositionerEl, {
            ...ctx.positioning,
            ...evt.options,
            defer: true,
            listeners: false,
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
            dom.getInitialFocusEl(ctx)?.focus({ preventScroll: true })
          })
        },
        restoreFocusIfNeeded(ctx, evt) {
          if (!evt.restoreFocus) return
          raf(() => {
            dom.getTriggerEl(ctx)?.focus({ preventScroll: true })
          })
        },
        invokeOnOpen(ctx) {
          ctx.onOpen?.()
        },
        invokeOnClose(ctx) {
          ctx.onClose?.()
        },
        toggleVisibility(ctx, _evt, { send }) {
          send({ type: ctx.open ? "OPEN" : "CLOSE", src: "controlled" })
        },
      },
    },
  )
}
