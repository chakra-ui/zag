import { createMachine, ref } from "@zag-js/core"
import { raf } from "@zag-js/dom-query"
import { compact } from "@zag-js/utils"
import { dom } from "./collapsible.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./collapsible.types"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "collapsible",
      initial: ctx.open ? "open" : "closed",

      context: {
        ...ctx,
        height: 0,
        width: 0,
        isMountAnimationPrevented: !!ctx.open,
        stylesRef: null,
      },

      watch: {
        open: ["toggleVisibility"],
      },

      entry: ["computeSize"],
      exit: ["clearAnimationStyles"],

      activities: ["trackMountAnimation"],

      states: {
        closed: {
          tags: ["closed"],
          entry: ["computeSize"],
          on: {
            "CONTROLLED.OPEN": "open",
            OPEN: [
              { guard: "isOpenControlled", actions: ["invokeOnOpen"] },
              { target: "open", actions: ["invokeOnOpen"] },
            ],
          },
        },

        closing: {
          tags: ["open"],
          activities: ["trackAnimationEvents"],
          on: {
            "CONTROLLED.CLOSE": "closed",
            "CONTROLLED.OPEN": "open",
            OPEN: [
              { guard: "isOpenControlled", actions: ["invokeOnOpen"] },
              { target: "open", actions: ["invokeOnOpen"] },
            ],
            CLOSE: [
              { guard: "isOpenControlled", actions: ["invokeOnClose"] },
              { target: "closed", actions: ["computeSize"] },
            ],
            "ANIMATION.END": "closed",
          },
        },

        open: {
          tags: ["open"],
          on: {
            "CONTROLLED.CLOSE": { target: "closing", actions: ["computeSize"] },
            CLOSE: [
              { guard: "isOpenControlled", actions: ["invokeOnClose"] },
              { target: "closing", actions: ["computeSize"] },
            ],
          },
        },
      },
    },
    {
      guards: {
        isOpenControlled: (ctx) => !!ctx.__controlled,
      },
      activities: {
        trackMountAnimation(ctx) {
          const cleanup = raf(() => {
            ctx.isMountAnimationPrevented = false
          })
          return () => {
            ctx.isMountAnimationPrevented = true
            cleanup()
          }
        },
        trackAnimationEvents(ctx, _evt, { send }) {
          const contentEl = dom.getContentEl(ctx)
          if (!contentEl) return

          const onEnd = (event: AnimationEvent) => {
            if (event.target !== contentEl) return
            send({ type: "ANIMATION.END" })
          }

          contentEl.addEventListener("animationend", onEnd)
          contentEl.addEventListener("animationcancel", onEnd)
          return () => {
            contentEl.removeEventListener("animationend", onEnd)
            contentEl.removeEventListener("animationcancel", onEnd)
          }
        },
      },
      actions: {
        computeSize: (ctx) => {
          const contentEl = dom.getContentEl(ctx)
          if (!contentEl) return

          ctx.stylesRef ||= ref({
            animationName: contentEl.style.animationName,
            animationDuration: contentEl.style.animationDuration,
          })

          const hidden = contentEl.hidden

          // block any animations/transitions so the element renders at its full dimensions
          contentEl.style.animationName = "none"
          contentEl.style.animationDuration = "0s"
          contentEl.hidden = false

          const rect = contentEl.getBoundingClientRect()
          ctx.height = rect.height
          ctx.width = rect.width

          // kick off any animations/transitions that were originally set up if it isn't the initial mount
          if (!ctx.isMountAnimationPrevented) {
            contentEl.style.animationName = ctx.stylesRef.animationName
            contentEl.style.animationDuration = ctx.stylesRef.animationDuration
          }

          contentEl.hidden = hidden
        },
        invokeOnOpen: (ctx) => {
          ctx.onOpenChange?.({ open: true })
        },
        invokeOnClose: (ctx) => {
          ctx.onOpenChange?.({ open: false })
        },
        toggleVisibility: (ctx, _evt, { send }) => {
          send({ type: ctx.open ? "CONTROLLED.OPEN" : "CONTROLLED.CLOSE" })
        },
        clearAnimationStyles: (ctx) => {
          // cleanup any animation properties that were set (esp for React.StrictMode)
          const contentEl = dom.getContentEl(ctx)
          if (!contentEl) return
          raf(() => {
            contentEl.style.animationName = ""
            contentEl.style.animationDuration = ""
          })
        },
      },
    },
  )
}
