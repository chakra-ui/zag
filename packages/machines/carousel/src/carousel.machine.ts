import { createMachine, ref } from "@zag-js/core"
import { compact, nextIndex, prevIndex } from "@zag-js/utils"
import { dom } from "./carousel.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./carousel.types"
import { getScrollSnap } from "./carousel.utils"

export function machine(userContext: UserDefinedContext) {
  const ctx = compact(userContext)
  return createMachine<MachineContext, MachineState>(
    {
      id: "carousel",
      initial: "idle",
      context: {
        ...ctx,
        index: 0,
        orientation: "horizontal",
        align: "start",
        loop: false,
        scrollSnap: 0,
        slidesPerView: 1,
        spacing: "40px",
        inViewThreshold: 0,
        containerSize: 0,
        slideRects: [],
      },
      states: {
        idle: {
          on: {
            NEXT: {
              actions: ["measureElements", "setNextIndex", "setScrollSnap"],
            },
            PREV: {
              actions: ["measureElements", "setPreviousIndex", "setScrollSnap"],
            },
          },
        },
      },
      entry: ["measureElements"],
      computed: {
        isRtl: (ctx) => ctx.dir === "rtl",
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
        isVertical: (ctx) => ctx.orientation === "vertical",
        canScrollNext: (ctx) => ctx.index < ctx.slideRects.length - 1,
        canScrollPrevious: (ctx) => ctx.index > 0,
        startEdge(ctx) {
          if (ctx.isVertical) return "top"
          return ctx.isRtl ? "right" : "left"
        },
        endEdge(ctx) {
          if (ctx.isVertical) return "bottom"
          return ctx.isRtl ? "left" : "right"
        },
        translateValue: (ctx) => {
          return ctx.isHorizontal ? `translate3d(${ctx.scrollSnap}px, 0, 0)` : `translate3d(0, ${ctx.scrollSnap}px, 0)`
        },
      },
    },
    {
      guards: {},
      actions: {
        setNextIndex(ctx) {
          ctx.index = nextIndex(ctx.slideRects, ctx.index)
        },
        setPreviousIndex(ctx) {
          ctx.index = prevIndex(ctx.slideRects, ctx.index)
        },
        setScrollSnap(ctx) {
          ctx.scrollSnap = getScrollSnap(ctx)[ctx.index]
        },
        measureElements(ctx) {
          ctx.containerRect = ref(dom.getSlideGroupEl(ctx).getBoundingClientRect())
          ctx.containerSize = ctx.isHorizontal ? ctx.containerRect.width : ctx.containerRect.height
          ctx.slideRects = ref(dom.getSlideEls(ctx).map((slide) => slide.getBoundingClientRect()))
        },
      },
    },
  )
}
