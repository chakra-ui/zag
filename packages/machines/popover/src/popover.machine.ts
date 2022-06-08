import { ariaHidden } from "@zag-js/aria-hidden"
import { createMachine, guards, ref } from "@zag-js/core"
import { contains, nextTick, preventBodyPointerEvents, raf, trackPointerDown } from "@zag-js/dom-utils"
import { getPlacement } from "@zag-js/popper"
import { preventBodyScroll } from "@zag-js/remove-scroll"
import { next, runIfFn } from "@zag-js/utils"
import { createFocusTrap, FocusTrap } from "focus-trap"
import { dom } from "./popover.dom"
import { MachineContext, MachineState, UserDefinedContext } from "./popover.types"

const { and, or } = guards

export function machine(ctx: UserDefinedContext = {}) {
  return createMachine<MachineContext, MachineState>(
    {
      id: "popover",
      initial: "unknown",
      context: {
        uid: "",
        closeOnBlur: true,
        closeOnEsc: true,
        autoFocus: true,
        modal: false,
        positioning: {
          placement: "bottom",
          ...ctx.positioning,
        },
        currentPlacement: undefined,
        ...ctx,
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
            SETUP: [
              {
                guard: "isOpen",
                target: "open",
                actions: ["setupDocument", "checkRenderedElements"],
              },
              {
                target: "closed",
                actions: ["setupDocument", "checkRenderedElements"],
              },
            ],
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
            "computePlacement",
          ],
          entry: ["setInitialFocus", "invokeOnOpen"],
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
          let unhide: VoidFunction | undefined
          nextTick(() => {
            unhide = ariaHidden([dom.getContentEl(ctx), dom.getTriggerEl(ctx)])
          })
          return () => unhide?.()
        },
        preventScroll(ctx) {
          return preventBodyScroll({
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
        closeOnEsc: (ctx) => !!ctx.closeOnEsc,
        autoFocus: (ctx) => !!ctx.autoFocus,
        modal: (ctx) => !!ctx.modal,
        portalled: (ctx) => !!ctx.portalled,
        isRelatedTargetFocusable: (_ctx, evt) => evt.focusable,
        closeOnBlur: (ctx) => !!ctx.closeOnBlur,
        isContentFocused: (ctx) => dom.getContentEl(ctx) === dom.getActiveEl(ctx),
        isFirstTabbableElement: (ctx) => dom.getFirstTabbableEl(ctx) === dom.getActiveEl(ctx),
        isLastTabbableElement: (ctx) => dom.getLastTabbableEl(ctx) === dom.getActiveEl(ctx),
        isOpen: (ctx) => !!ctx.open,
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
        focusTrigger(ctx) {
          raf(() => {
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
          raf(() => elementAfterTrigger?.focus())
        },
      },
    },
  )
}
