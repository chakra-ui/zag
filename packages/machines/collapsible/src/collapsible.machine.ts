import { createMachine, ref } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import { dom } from "./collapsible.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./collapsible.types"
import { raf } from "@zag-js/dom-query"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "collapsible",
      initial: ctx.open ? "open" : "closed",

      context: {
        height: 0,
        width: 0,
        isMountAnimationPrevented: !!ctx.open,
        stylesRef: ref<any>({}),
        ...ctx,
      },

      entry: ["setMountAnimationPrevented"],

      states: {
        closed: {
          on: {
            TOGGLE: {
              target: "open",
              actions: ["computeSize", "invokeOnOpen"],
            },
            OPEN: {
              target: "open",
              actions: ["computeSize", "invokeOnOpen"],
            },
          },
        },

        open: {
          on: {
            TOGGLE: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
            CLOSE: {
              target: "closed",
              actions: ["invokeOnClose"],
            },
          },
        },
      },
    },
    {
      actions: {
        setMountAnimationPrevented(ctx) {
          raf(() => (ctx.isMountAnimationPrevented = false))
        },
        computeSize: (ctx) => {
          const contentEl = dom.getContentEl(ctx)
          if (!contentEl) return

          ctx.stylesRef ||= {
            transitionDuration: contentEl.style.transitionDuration,
            animationName: contentEl.style.animationName,
          }

          // block any animations/transitions so the element renders at its full dimensions
          contentEl.style.transitionDuration = "0s"
          contentEl.style.animationName = "none"

          // get width and height from full dimensions
          const rect = contentEl.getBoundingClientRect()
          ctx.height = rect.height
          ctx.width = rect.width

          // kick off any animations/transitions that were originally set up if it isn't the initial mount
          if (!ctx.isMountAnimationPrevented) {
            contentEl.style.transitionDuration = ctx.stylesRef.transitionDuration
            contentEl.style.animationName = ctx.stylesRef.animationName
          }
        },
        invokeOnOpen: (ctx) => {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose: (ctx) => {
          ctx.onOpenChange?.({ open: false })
        },
      },
    },
  )
}
