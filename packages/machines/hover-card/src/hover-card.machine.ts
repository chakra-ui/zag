import { createMachine, guards } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
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
          entry: ["clearIsPointer"],
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
            OPEN_DELAY: {
              target: "open",
              actions: ["invokeOnOpen"],
            },
          },
          on: {
            POINTER_LEAVE: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
            TRIGGER_BLUR: {
              guard: not("isPointer"),
              target: "closed",
              actions: ["invokeOnClose"],
            },
            CLOSE: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
          },
        },

        open: {
          tags: ["open"],
          activities: ["trackDismissableElement", "trackPositioning"],
          on: {
            POINTER_ENTER: {
              actions: ["setIsPointer"],
            },
            POINTER_LEAVE: "closing",
            DISMISS: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
            CLOSE: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
            TRIGGER_BLUR: {
              guard: not("isPointer"),
              target: "closed",
              actions: ["invokeOnClose"],
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
            CLOSE_DELAY: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
          },
          on: {
            POINTER_ENTER: {
              target: "open",
              // no need to invokeOnOpen here because it's still open (but about to close)
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
          const getPositionerEl = () => dom.getPositionerEl(ctx)
          return getPlacement(dom.getTriggerEl(ctx), getPositionerEl, {
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
          return trackDismissableElement(getContentEl, {
            defer: true,
            exclude: [dom.getTriggerEl(ctx)],
            onDismiss() {
              send({ type: "DISMISS" })
            },
            onFocusOutside(event) {
              event.preventDefault()
            },
          })
        },
      },
      actions: {
        invokeOnClose(ctx) {
          ctx.onClose?.()
        },
        invokeOnOpen(ctx) {
          ctx.onOpen?.()
        },
        setIsPointer(ctx) {
          ctx.isPointer = true
        },
        clearIsPointer(ctx) {
          ctx.isPointer = false
        },
        setPositioning(ctx, evt) {
          const getPositionerEl = () => dom.getPositionerEl(ctx)
          getPlacement(dom.getTriggerEl(ctx), getPositionerEl, {
            ...ctx.positioning,
            ...evt.options,
            defer: true,
            listeners: false,
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
