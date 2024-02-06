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
        stylesRef: null,
        ...ctx,
      },

      entry: ["setMountAnimationPrevented"],

      states: {
        closed: {
          tags: ["closed"],
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

        closing: {
          tags: ["open"],
          activities: ["trackAnimationEvents"],
          on: {
            "ANIMATION.END": {
              target: "closed",
              actions: ["invokeOnClose"],
            },
          },
        },

        open: {
          tags: ["open"],
          on: {
            TOGGLE: {
              target: "closing",
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
      activities: {
        trackAnimationEvents(ctx, _evt, { send }) {
          const contentEl = dom.getContentEl(ctx)
          if (!contentEl) return

          const onAnimationEnd = () => send("ANIMATION.END")
          contentEl.addEventListener("animationend", onAnimationEnd)

          return () => contentEl.removeEventListener("animationend", onAnimationEnd)
        },
      },
      actions: {
        setMountAnimationPrevented(ctx) {
          raf(() => (ctx.isMountAnimationPrevented = false))
        },
        computeSize: (ctx, _evt) => {
          const contentEl = dom.getContentEl(ctx)
          if (!contentEl) return

          ctx.stylesRef ||= ref({
            animationDuration: contentEl.style.animationDuration,
            animationName: contentEl.style.animationName,
            hidden: contentEl.hidden,
          })

          // block any animations/transitions so the element renders at its full dimensions
          contentEl.style.animationDuration = "0s"
          contentEl.style.animationName = "none"

          // get width and height from full dimensions
          contentEl.hidden = !ctx.stylesRef.hidden

          const rect = contentEl.getBoundingClientRect()

          ctx.height = rect.height
          ctx.width = rect.width

          contentEl.hidden = ctx.stylesRef.hidden

          // kick off any animations/transitions that were originally set up if it isn't the initial mount
          if (!ctx.isMountAnimationPrevented) {
            contentEl.style.animationDuration = ctx.stylesRef.animationDuration
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
