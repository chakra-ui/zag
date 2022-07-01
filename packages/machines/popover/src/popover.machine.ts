import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine, guards, ref } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dimissable"
import { addDomEvent, contains, nextTick, raf } from "@zag-js/dom-utils"
import { getPlacement } from "@zag-js/popper"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import { isModifiedEvent, next, runIfFn } from "@zag-js/utils"
import { createFocusTrap, FocusTrap } from "focus-trap"
import { dom } from "./popover.dom"
import { MachineContext, MachineState, UserDefinedContext } from "./popover.types"

const { and, or, not } = guards

export function machine(ctx: UserDefinedContext = {}) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "popover",
      initial: "unknown",
      context: {
        uid: "",
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
        preventReturnFocus: false,
        renderedElements: {
          title: true,
          description: true,
          anchor: false,
        },
      },

      computed: {
        currentPortalled: (ctx) => !!ctx.modal || !!ctx.portalled,
      },

      states: {
        unknown: {
          on: {
            SETUP: {
              target: ctx.defaultOpen ? "open" : "closed",
              actions: ["setupDocument", "checkRenderedElements"],
            },
          },
        },

        closed: {
          entry: ["clearPointerDown", "invokeOnClose"],
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
            "computePlacement",
            "trackInteractionOutside",
            "trackTabKeyDown",
          ],
          entry: ["setInitialFocus", "invokeOnOpen"],
          on: {
            CLOSE: "closed",
            REQUEST_CLOSE: {
              target: "closed",
              actions: "focusTriggerIfNeeded",
            },
            TOGGLE: "closed",
            TRIGGER_BLUR: {
              guard: not("isRelatedTargetWithinContent"),
              target: "closed",
            },
            TAB: [
              {
                guard: and("isTriggerFocused", "portalled"),
                actions: "focusFirstTabbableElement",
              },
              {
                guard: and("isLastTabbableElement", "closeOnInteractOutside", "portalled"),
                target: "closed",
                actions: "focusNextTabbableElementAfterTrigger",
              },
            ],
            SHIFT_TAB: {
              guard: and(or("isFirstTabbableElement", "isContentFocused"), "portalled"),
              actions: "focusTriggerIfNeeded",
            },
          },
        },
      },
    },
    {
      activities: {
        computePlacement(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          const anchorEl = ctx.renderedElements.anchor ? dom.getAnchorEl(ctx) : dom.getTriggerEl(ctx)
          return getPlacement(anchorEl, dom.getPositionerEl(ctx), {
            ...ctx.positioning,
            onComplete(data) {
              ctx.currentPlacement = data.placement
              ctx.isPlacementComplete = true
            },
            onCleanup() {
              ctx.currentPlacement = undefined
              ctx.isPlacementComplete = false
            },
          })
        },
        trackInteractionOutside(ctx, _evt, { send }) {
          return trackDismissableElement(dom.getContentEl(ctx), {
            pointerBlocking: ctx.modal,
            excludeContainers: dom.getTriggerEl(ctx),
            onEscapeKeyDown(event) {
              ctx.onEscapeKeyDown?.(event)
              if (ctx.closeOnEsc) return
              event.preventDefault()
            },
            onInteractOutside(event) {
              ctx.onInteractOutside?.(event)
              if (event.defaultPrevented) return
              ctx.preventReturnFocus = event.detail.focusable || event.detail.contextmenu
              if (!ctx.closeOnInteractOutside) {
                event.preventDefault()
              }
            },
            onPointerDownOutside(event) {
              ctx.onPointerDownOutside?.(event)
            },
            onFocusOutside(event) {
              ctx.onFocusOutside?.(event)
              if (ctx.currentPortalled) {
                event.preventDefault()
              }
            },
            onDismiss() {
              send({ type: "REQUEST_CLOSE", src: "#interact-outside" })
            },
          })
        },
        trackTabKeyDown(ctx, _evt, { send }) {
          if (ctx.modal) return
          return addDomEvent(
            dom.getWin(ctx),
            "keydown",
            (event) => {
              const isTabKey = event.key === "Tab" && !isModifiedEvent(event)
              if (!isTabKey) return
              send({
                type: event.shiftKey ? "SHIFT_TAB" : "TAB",
                preventDefault: () => event.preventDefault(),
              })
            },
            true,
          )
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
          return preventBodyScroll({
            disabled: !ctx.modal,
            document: dom.getDoc(ctx),
          })
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
      guards: {
        portalled: (ctx) => ctx.currentPortalled,
        isRelatedTargetWithinContent: (ctx, evt) => contains(dom.getContentEl(ctx), evt.target),
        closeOnInteractOutside: (ctx) => !!ctx.closeOnInteractOutside,
        isContentFocused: (ctx) => dom.getContentEl(ctx) === dom.getActiveEl(ctx),
        isTriggerFocused: (ctx) => dom.getTriggerEl(ctx) === dom.getActiveEl(ctx),
        isFirstTabbableElement: (ctx) => dom.getFirstTabbableEl(ctx) === dom.getActiveEl(ctx),
        isLastTabbableElement: (ctx) => dom.getLastTabbableEl(ctx) === dom.getActiveEl(ctx),
      },
      actions: {
        checkRenderedElements(ctx) {
          raf(() => {
            Object.assign(ctx.renderedElements, {
              title: !!dom.getTitleEl(ctx),
              description: !!dom.getDescriptionEl(ctx),
              anchor: !!dom.getAnchorEl(ctx),
            })
          })
        },
        setupDocument(ctx, evt) {
          if (evt.doc) ctx.doc = ref(evt.doc)
          if (evt.root) ctx.rootNode = ref(evt.root)
          ctx.uid = evt.id
        },
        clearPointerDown(ctx) {
          ctx.pointerdownNode = null
        },
        setInitialFocus(ctx) {
          raf(() => {
            dom.getInitialFocusEl(ctx)?.focus()
          })
        },
        focusTriggerIfNeeded(ctx) {
          const focus = () => dom.getTriggerEl(ctx)?.focus()
          raf(() => {
            if (!ctx.preventReturnFocus) {
              focus()
              ctx.preventReturnFocus = false
            }
          })
        },
        focusFirstTabbableElement(ctx, evt) {
          evt.preventDefault()
          dom.getFirstTabbableEl(ctx)?.focus()
        },
        invokeOnOpen(ctx, evt) {
          if (evt.type !== "SETUP") {
            ctx.onOpenChange?.(true)
          }
        },
        invokeOnClose(ctx, evt) {
          if (evt.type !== "SETUP") {
            ctx.onOpenChange?.(false)
          }
        },
        focusNextTabbableElementAfterTrigger(ctx, evt) {
          const content = dom.getContentEl(ctx)
          const button = dom.getTriggerEl(ctx)

          if (!content || !button) return

          const lastTabbable = dom.getLastTabbableEl(ctx)
          if (lastTabbable !== dom.getActiveEl(ctx)) return

          let tabbables = dom.getDocTabbableEls(ctx)
          let elementAfterTrigger = next(tabbables, tabbables.indexOf(button), { loop: false })

          // content is just after button (in dom order) ???
          if (elementAfterTrigger === content) {
            tabbables = tabbables.filter((el) => !contains(content, el))
            elementAfterTrigger = next(tabbables, tabbables.indexOf(button), { loop: false })
          }

          // if there's no next element, let the browser handle it
          if (!elementAfterTrigger || elementAfterTrigger === button) return

          // else focus the next tabbable element after trigger (simulating native behavior)
          evt.preventDefault()
          raf(() => elementAfterTrigger?.focus())
        },
      },
    },
  )
}
