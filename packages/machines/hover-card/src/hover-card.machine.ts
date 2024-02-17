import { createMachine, guards } from "@zag-js/core"
import { trackDismissableElement } from "@zag-js/dismissable"
import { getPlacement } from "@zag-js/popper"
import { compact } from "@zag-js/utils"
import { dom } from "./hover-card.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./hover-card.types"

const { not, and } = guards

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
            "CONTROLLED.OPEN": "open",
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
            OPEN_DELAY: [
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
          on: {
            "CONTROLLED.OPEN": "open",
            POINTER_LEAVE: [
              {
                guard: "isOpenControlled",
                actions: ["invokeOnClose"],
              },
              {
                target: "closed",
                actions: ["invokeOnClose"],
              },
            ],
            TRIGGER_BLUR: [
              {
                guard: and("isOpenControlled", not("isPointer")),
                actions: ["invokeOnClose"],
              },
              {
                guard: not("isPointer"),
                target: "closed",
                actions: ["invokeOnClose"],
              },
            ],
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
          },
        },

        open: {
          tags: ["open"],
          activities: ["trackDismissableElement", "trackPositioning"],
          on: {
            "CONTROLLED.CLOSE": "closed",
            POINTER_ENTER: {
              actions: ["setIsPointer"],
            },
            POINTER_LEAVE: "closing",
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
            TRIGGER_BLUR: [
              {
                guard: and("isOpenControlled", not("isPointer")),
                actions: ["invokeOnClose"],
              },
              {
                guard: not("isPointer"),
                target: "closed",
                actions: ["invokeOnClose"],
              },
            ],
            "POSITIONING.SET": {
              actions: "reposition",
            },
          },
        },

        closing: {
          tags: ["open"],
          activities: ["trackPositioning"],
          after: {
            CLOSE_DELAY: [
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
          on: {
            "CONTROLLED.CLOSE": "closed",
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
        isOpenControlled: (ctx) => !!ctx["open.controlled"],
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
          })
        },
        trackDismissableElement(ctx, _evt, { send }) {
          const getContentEl = () => dom.getContentEl(ctx)
          return trackDismissableElement(getContentEl, {
            defer: true,
            exclude: [dom.getTriggerEl(ctx)],
            onDismiss() {
              send({ type: "CLOSE", src: "interact-outside" })
            },
            onFocusOutside(event) {
              event.preventDefault()
            },
          })
        },
      },
      actions: {
        invokeOnClose(ctx) {
          ctx.onOpenChange?.({ open: false })
        },
        invokeOnOpen(ctx) {
          ctx.onOpenChange?.({ open: true })
        },
        setIsPointer(ctx) {
          ctx.isPointer = true
        },
        clearIsPointer(ctx) {
          ctx.isPointer = false
        },
        reposition(ctx, evt) {
          const getPositionerEl = () => dom.getPositionerEl(ctx)
          getPlacement(dom.getTriggerEl(ctx), getPositionerEl, {
            ...ctx.positioning,
            ...evt.options,
            defer: true,
            listeners: false,
            onComplete(data) {
              ctx.currentPlacement = data.placement
            },
          })
        },
        toggleVisibility(ctx, evt, { send }) {
          send({ type: ctx.open ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE", previousEvent: evt })
        },
      },
      delays: {
        OPEN_DELAY: (ctx) => ctx.openDelay,
        CLOSE_DELAY: (ctx) => ctx.closeDelay,
      },
    },
  )
}
