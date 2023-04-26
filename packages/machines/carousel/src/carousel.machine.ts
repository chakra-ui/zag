import { createMachine, ref } from "@zag-js/core"
import { compact, nextIndex, prevIndex } from "@zag-js/utils"
import { dom } from "./carousel.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./carousel.types"
import { getScrollSnaps } from "./utils/get-scroll-snaps"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "carousel",
      initial: "idle",
      context: {
        index: 0,
        orientation: "horizontal",
        align: "start",
        loop: false,
        scrollSnaps: [],
        slidesPerView: 1,
        spacing: "0px",
        ...ctx,
        inViewThreshold: 0,
        containerSize: 0,
        slideRects: [],
      },
      watch: {
        index: ["invokeOnSlideChange", "setScrollSnaps"],
      },
      on: {
        NEXT: {
          actions: ["setNextIndex"],
        },
        PREV: {
          actions: ["setPreviousIndex"],
        },
        GOTO: {
          actions: ["setIndex"],
        },
        MUTATION: {
          actions: ["measureElements", "setScrollSnaps"],
        },
      },
      states: {
        idle: {
          on: {
            POINTER_DOWN: "dragging",
          },
        },
        autoplay: {
          every: {
            2000: ["setNextIndex"],
          },
          on: {
            PAUSE: "idle",
          },
        },
        dragging: {
          on: {
            POINTER_UP: "idle",
            POINTER_MOVE: {
              actions: ["setScrollSnaps"],
            },
          },
        },
      },
      activities: ["trackContainerResize", "trackSlideMutation"],
      entry: ["measureElements", "setScrollSnaps"],
      computed: {
        isRtl: (ctx) => ctx.dir === "rtl",
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
        isVertical: (ctx) => ctx.orientation === "vertical",
        canScrollNext: (ctx) => ctx.loop || ctx.index < ctx.scrollSnaps.length - 1,
        canScrollPrevious: (ctx) => ctx.loop || ctx.index > 0,
        startEdge(ctx) {
          if (ctx.isVertical) return "top"
          return ctx.isRtl ? "right" : "left"
        },
        endEdge(ctx) {
          if (ctx.isVertical) return "bottom"
          return ctx.isRtl ? "left" : "right"
        },
        translateValue: (ctx) => {
          const scrollSnap = ctx.scrollSnaps[ctx.index]
          return ctx.isHorizontal ? `translate3d(${scrollSnap}px, 0, 0)` : `translate3d(0, ${scrollSnap}px, 0)`
        },
      },
    },
    {
      activities: {
        trackSlideMutation(ctx, _evt, { send }) {
          const container = dom.getSlideGroupEl(ctx)
          const win = dom.getWin(ctx)
          const observer = new win.MutationObserver(() => {
            send("MUTATION")
          })
          observer.observe(container, { childList: true })
          return () => {
            observer.disconnect()
          }
        },
        trackContainerResize(ctx, _evt) {
          const container = dom.getSlideGroupEl(ctx)
          const win = dom.getWin(ctx)
          const observer = new win.ResizeObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.target === container) {
                measureElements(ctx)
              }
            })
          })
          observer.observe(container)
          return () => {
            observer.disconnect()
          }
        },
      },
      guards: {
        loop: (ctx) => ctx.loop,
        isLastSlide: (ctx) => ctx.index === ctx.slideRects.length - 1,
        isFirstSlide: (ctx) => ctx.index === 0,
      },
      actions: {
        invokeOnSlideChange(ctx, _evt) {
          ctx.onSlideChange?.({ index: ctx.index })
        },
        setNextIndex(ctx) {
          ctx.index = nextIndex(ctx.slideRects, ctx.index)
        },
        setPreviousIndex(ctx) {
          ctx.index = prevIndex(ctx.slideRects, ctx.index)
        },
        setScrollSnaps(ctx) {
          const { snapsAligned } = getScrollSnaps(ctx)
          ctx.scrollSnaps = snapsAligned
        },
        setIndex(ctx, evt) {
          ctx.index = Math.max(0, Math.min(evt.index, ctx.slideRects.length - 1))
        },
        measureElements,
      },
    },
  )
}

const measureElements = (ctx: MachineContext) => {
  const container = dom.getSlideGroupEl(ctx)
  ctx.containerRect = ref(container.getBoundingClientRect())
  ctx.containerSize = ctx.isHorizontal ? ctx.containerRect.width : ctx.containerRect.height
  ctx.slideRects = ref(dom.getSlideEls(ctx).map((slide) => slide.getBoundingClientRect()))
}
