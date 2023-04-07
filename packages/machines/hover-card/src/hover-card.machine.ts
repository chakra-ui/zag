import { createMachine, guards } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { raf } from "@zag-js/dom-query"
import { getPlacement } from "@zag-js/popper"
import { compact } from "@zag-js/utils"
import { dom } from "./hover-card.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./hover-card.types"

const { not } = guards

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "hover-card",
      initial: ctx.open ? "open" : "closed",
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

      watch: {
        open: ["toggleVisibility"],
      },

      states: {
        closed: {
          tags: ["closed"],
          entry: ["invokeOnClose", "clearIsPointer"],
          on: {
            POINTER_ENTER: {
              target: "opening",
              actions: ["setIsPointer"],
            },
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
          activities: ["trackDismissableElement", "trackPositioning"],
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
            SET_POSITIONING: {
              actions: "setPositioning",
            },
          },
        },

        closing: {
          tags: ["open"],
          activities: ["trackPositioning"],
          after: {
            CLOSE_DELAY: "closed",
          },
          on: {
            POINTER_ENTER: {
              target: "open",
              actions: ["setIsPointer"],
            },
          },
        },
      },
    },
    {
      guards: {
        isPointer: (ctx) => !!ctx.isPointer,
      },
      activities: {
        trackPositioning(ctx) {
          ctx.currentPlacement = ctx.positioning.placement
          let cleanup: VoidFunction | undefined
          raf(() => {
            cleanup = getPlacement(dom.getTriggerEl(ctx), dom.getPositionerEl(ctx), {
              ...ctx.positioning,
              onComplete(data) {
                ctx.currentPlacement = data.placement
              },
              onCleanup() {
                ctx.currentPlacement = undefined
              },
            })
          })
          return () => cleanup?.()
        },
        trackDismissableElement(ctx, _evt, { send }) {
          let cleanup: VoidFunction | undefined
          raf(() => {
            cleanup = trackDismissableElement(dom.getContentEl(ctx), {
              exclude: [dom.getTriggerEl(ctx)],
              onDismiss() {
                send({ type: "DISMISS" })
              },
              onFocusOutside(event) {
                event.preventDefault()
              },
            })
          })
          return () => cleanup?.()
        },
      },
      actions: {
        invokeOnClose(ctx) {
          ctx.onOpenChange?.(false)
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.(true)
        },
        setIsPointer(ctx) {
          ctx.isPointer = true
        },
        clearIsPointer(ctx) {
          ctx.isPointer = false
        },
        setPositioning(ctx, evt) {
          raf(() => {
            getPlacement(dom.getTriggerEl(ctx), dom.getPositionerEl(ctx), {
              ...ctx.positioning,
              ...evt.options,
              listeners: false,
            })
          })
        },
        toggleVisibility(ctx, _evt, { send }) {
          send({ type: ctx.open ? "OPEN" : "CLOSE", src: "controlled" })
        },
      },
      delays: {
        OPEN_DELAY: (ctx) => ctx.openDelay,
        CLOSE_DELAY: (ctx) => ctx.closeDelay,
      },
    },
  )
}
