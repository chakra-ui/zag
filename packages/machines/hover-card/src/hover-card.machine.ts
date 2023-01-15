import { createMachine, guards } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { raf } from "@zag-js/dom-utils"
import { getPlacement } from "@zag-js/popper"
import { compact } from "@zag-js/utils"
import { dom } from "./hover-card.dom"
import { MachineContext, MachineState, UserDefinedContext } from "./hover-card.types"

const { not } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "hover-card",
      initial: "unknown",
      context: {
        openDelay: 700,
        closeDelay: 300,
        currentPlacement: undefined,
        ...ctx,
        positioning: {
          placement: "bottom",
          ...ctx.positioning,
        },
      },

      states: {
        unknown: {
          on: {
            SETUP: {
              target: ctx.defaultOpen ? "open" : "closed",
            },
          },
        },

        closed: {
          tags: ["closed"],
          entry: ["invokeOnClose", "clearIsPointer"],
          on: {
            POINTER_ENTER: { actions: ["setIsPointer"], target: "opening" },
            TRIGGER_FOCUS: "opening",
            OPEN: "opening",
          },
        },

        opening: {
          tags: ["closed"],
          after: {
            OPEN_DELAY: "open",
          },
          on: {
            POINTER_LEAVE: "closed",
            TRIGGER_BLUR: {
              guard: not("isPointer"),
              target: "closed",
            },
            CLOSE: "closed",
          },
        },

        open: {
          tags: ["open"],
          activities: ["trackDismissableElement", "computePlacement"],
          entry: ["invokeOnOpen"],
          on: {
            POINTER_ENTER: { actions: ["setIsPointer"] },
            POINTER_LEAVE: "closing",
            DISMISS: "closed",
            CLOSE: "closed",
            TRIGGER_BLUR: {
              guard: not("isPointer"),
              target: "closed",
            },
          },
        },

        closing: {
          tags: ["open"],
          activities: ["computePlacement"],
          after: {
            CLOSE_DELAY: "closed",
          },
          on: {
            POINTER_ENTER: { actions: ["setIsPointer"], target: "open" },
          },
        },
      },
    },
    {
      guards: {
        isPointer: (ctx) => !!ctx.isPointer,
      },
      activities: {
        computePlacement(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          let cleanup: VoidFunction | undefined
          raf(() => {
            cleanup = getPlacement(dom.getTriggerEl(ctx), dom.getPositionerEl(ctx), {
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
          })
          return cleanup
        },
        trackDismissableElement(ctx, _evt, { send }) {
          let cleanup: VoidFunction | undefined
          raf(() => {
            cleanup = trackDismissableElement(dom.getContentEl(ctx), {
              exclude: [dom.getTriggerEl(ctx)],
              onDismiss: () => send({ type: "DISMISS" }),
              onFocusOutside(event) {
                event.preventDefault()
              },
            })
          })
          return () => cleanup?.()
        },
      },
      actions: {
        invokeOnClose(ctx, evt) {
          if (evt.type !== "SETUP") {
            ctx.onOpenChange?.(false)
          }
        },
        invokeOnOpen(ctx, evt) {
          if (evt.type !== "SETUP") {
            ctx.onOpenChange?.(true)
          }
        },
        setIsPointer(ctx) {
          ctx.isPointer = true
        },
        clearIsPointer(ctx) {
          ctx.isPointer = false
        },
      },
      delays: {
        OPEN_DELAY: (ctx) => ctx.openDelay,
        CLOSE_DELAY: (ctx) => ctx.closeDelay,
      },
    },
  )
}
