import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { getInitialFocus, nextTick, proxyTabFocus, raf } from "@zag-js/dom-query"
import { getPlacement } from "@zag-js/popper"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import { compact } from "@zag-js/utils"
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
        closeOnEscape: true,
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
            "CONTROLLED.OPEN": {
              target: "open",
              actions: ["setInitialFocus"],
            },
            TOGGLE: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["invokeOnOpen", "setInitialFocus"],
              },
            ],
            OPEN: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnOpen"],
              },
              {
                target: "open",
                actions: ["invokeOnOpen", "setInitialFocus"],
              },
            ],
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
          on: {
            "CONTROLLED.CLOSE": {
              target: "closed",
              actions: ["setFinalFocus"],
            },
            CLOSE: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "closed",
                actions: ["invokeOnClose", "setFinalFocus"],
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
            "POSITIONING.SET": {
              actions: "reposition",
            },
          },
        },
      },
    },
    {
      guards: {
        isOpenControlled: (ctx) => !!ctx["open.controlled"],
      },
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
              if (ctx.closeOnEscape) return
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
            persistentElements: ctx.persistentElements,
            onDismiss() {
              send({ type: "CLOSE", src: "interact-outside", restoreFocus })
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
            const contentEl = dom.getContentEl(ctx)
            if (!contentEl) return
            trap = createFocusTrap(contentEl, {
              escapeDeactivates: false,
              allowOutsideClick: true,
              preventScroll: true,
              returnFocusOnDeactivate: true,
              document: dom.getDoc(ctx),
              fallbackFocus: contentEl,
              initialFocus: getInitialFocus({
                root: dom.getContentEl(ctx),
                getInitialEl: ctx.initialFocusEl,
                enabled: ctx.autoFocus,
              }),
            })

            try {
              trap.activate()
            } catch {}
          })
          return () => trap?.deactivate()
        },
      },
      actions: {
        reposition(ctx, evt) {
          const anchorEl = dom.getAnchorEl(ctx) ?? dom.getTriggerEl(ctx)
          const getPositionerEl = () => dom.getPositionerEl(ctx)
          getPlacement(anchorEl, getPositionerEl, {
            ...ctx.positioning,
            ...evt.options,
            defer: true,
            listeners: false,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
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
          // handoff to `trapFocus` activity for initial focus
          if (ctx.modal) return
          raf(() => {
            const element = getInitialFocus({
              root: dom.getContentEl(ctx),
              getInitialEl: ctx.initialFocusEl,
              enabled: ctx.autoFocus,
            })
            element?.focus({ preventScroll: true })
          })
        },
        setFinalFocus(ctx, evt) {
          if (!evt.restoreFocus) return
          raf(() => {
            const element = dom.getTriggerEl(ctx)
            element?.focus({ preventScroll: true })
          })
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        toggleVisibility(ctx, evt, { send }) {
          send({ type: ctx.open ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: evt })
        },
      },
    },
  )
}
