import { createMachine } from "@zag-js/core"
import { raf } from "@zag-js/dom-query"
import { compact } from "@zag-js/utils"
import { animator } from "./animator"
import { debounce } from "./debounce"
import { dom } from "./scroll-area.dom"
import { type MachineContext, type MachineState, type UserDefinedContext } from "./scroll-area.types"

const rafLoop = (fn: () => void) => {
  let rafId: any
  const loop = () => {
    fn()
    rafId = raf(loop)
  }
  rafId = raf(loop)
  return () => rafId && cancelAnimationFrame(rafId)
}

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "scroll-area",
      initial: "sticky",

      context: {
        scrollHeight: 0,
        offsetHeight: 0,
        scrollTop: 0,
        animateFrom: 0,
        animateTo: ctx.scrollMode === "top" ? 0 : "100%",
        scrollBehavior: "auto",
        scrollMode: "bottom",
        canceledAt: null,
        ignoreScrollEventBefore: 0,
        ...ctx,
      },

      computed: {
        isAnimating: (ctx) => ctx.animateTo !== null,
        atTop: (ctx) => ctx.scrollTop < 1,
        atBottom: (ctx) => ctx.scrollHeight - ctx.scrollTop - ctx.offsetHeight < 1,
        atStart: (ctx) => (ctx.scrollMode === "top" ? ctx.atBottom : ctx.atTop),
        atEnd: (ctx) => (ctx.scrollMode === "top" ? ctx.atTop : ctx.atBottom),
      },

      entry: ["setScrollProps"],

      watch: {
        animateTo: ["splineTo"],
      },

      activities: ["trackScrollEvent", "trackFocusEvent"],

      on: {
        SPLINE: {
          actions: ["splineTo"],
        },
      },

      states: {
        idle: {
          on: {
            "STICKY.START": {
              target: "sticky",
              actions: ["scrollToSticky"],
            },
          },
        },
        sticky: {
          entry: ["splineTo"],
          activities: ["trackWheelEvent"],
          on: {
            "STICKY.START": {
              actions: ["scrollToSticky"],
            },
            "STICKY.END": {
              target: "idle",
              actions: ["clearAnimateTo"],
            },
          },
        },
      },
    },
    {
      guards: {},
      activities: {
        // checkInterval(_ctx, _evt, { send }) {
        //   return rafLoop(() => {
        //     send({ type: "SPLINE" })
        //   })
        // },
        trackFocusEvent(ctx) {
          const rootEl = dom.getRootEl(ctx)
          if (!rootEl) return
          const onFocusWithin = () => {
            ctx.scrollHeight = rootEl.scrollHeight
          }
          rootEl.addEventListener("focus", onFocusWithin, { capture: true, passive: true })
          return () => rootEl.removeEventListener("focus", onFocusWithin)
        },

        trackWheelEvent(ctx, _evt) {
          const rootEl = dom.getRootEl(ctx)
          if (!rootEl) return
          const onCancel = () => ctx.splineCleanup?.()

          rootEl.addEventListener("wheel", onCancel, { passive: true })
          rootEl.addEventListener("pointerdown", onCancel, { passive: true })
          return () => {
            rootEl.removeEventListener("wheel", onCancel)
            rootEl.removeEventListener("pointerdown", onCancel)
          }
        },

        trackScrollEvent(ctx, _evt, { getState, send }) {
          const rootEl = dom.getRootEl(ctx)
          if (!rootEl) return

          const update = debounce((event: any) => {
            const rootEl = dom.getRootEl(ctx)
            if (!rootEl) return

            if (event.timeStampLow <= ctx.ignoreScrollEventBefore) {
              return
            }

            const { offsetHeight: nextOffsetHeight, scrollHeight: nextScrollHeight } = rootEl

            const offsetHeightChanged = nextOffsetHeight !== ctx.offsetHeight
            const scrollHeightChanged = nextScrollHeight !== ctx.scrollHeight

            ctx.offsetHeight = nextOffsetHeight
            ctx.scrollHeight = nextScrollHeight
            ctx.scrollTop = rootEl.scrollTop

            const state = getState()
            const inSticky = state.matches("sticky")

            // if (!offsetHeightChanged && !scrollHeightChanged) {
            //   if (!ctx.atEnd) return
            //   send({ type: "STICKY.START" })
            //   return
            // }

            if (!inSticky && ctx.atEnd) {
              send({ type: "STICKY.START", src: "scroll.event" })
            }
          }, 17)

          const onScroll = (event: Event) => {
            ;(event as any).timeStampLow = Date.now()
            update(event)
          }

          onScroll({ target: rootEl, type: "scroll" } as any)

          rootEl.addEventListener("scroll", onScroll, { passive: true })
          return () => rootEl.removeEventListener("scroll", onScroll)
        },
      },
      actions: {
        setScrollProps(ctx) {
          raf(() => {
            const rootEl = dom.getRootEl(ctx)
            if (!rootEl) return
            ctx.offsetHeight = rootEl.offsetHeight
            ctx.scrollHeight = rootEl.scrollHeight
            ctx.scrollTop = rootEl.scrollTop
          })
        },
        setAnimateTo(ctx, evt) {
          ctx.animateTo = evt.value
        },
        clearAnimateTo(ctx) {
          ctx.animateTo = null
        },
        scrollToSticky(ctx) {
          const rootEl = dom.getRootEl(ctx)
          if (!rootEl) return

          const { offsetHeight, scrollHeight, scrollTop } = rootEl

          const maxValue = ctx.scrollMode === "top" ? 0 : Math.max(0, scrollHeight - offsetHeight - scrollTop)
          const nextValue = Math.max(0, maxValue)

          if (ctx.scrollMode === "top" || nextValue !== maxValue) {
            ctx.animateTo = scrollTop + nextValue
          } else {
            ctx.animateTo = "100%"
          }
        },
        cleanupSpline(ctx) {
          ctx.splineCleanup?.()
        },
        splineTo(ctx, _evt, { send, getState }) {
          const rootEl = dom.getRootEl(ctx)

          if (!rootEl || ctx.animateTo == null) {
            return ctx.splineCleanup?.()
          }

          const state = getState()

          ctx.splineCleanup = animator({
            name: "scrollTop",
            value: ctx.animateTo,
            target: rootEl,
            onEnd() {
              ctx.ignoreScrollEventBefore = Date.now()
              if (!ctx.atEnd || state.event.src === "scroll.event") return
              send({ type: "STICKY.END" })
            },
          })
        },
      },
    },
  )
}

function isEnd(animateTo: MachineContext["animateTo"], mode: MachineContext["scrollMode"]) {
  return animateTo === (mode === "top" ? 0 : "100%")
}
