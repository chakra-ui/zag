import { createMachine, ref } from "@zag-js/core"
import { compact } from "@zag-js/utils"
import { dom } from "./carousel.dom"
import type { MachineContext, MachineState, UserDefinedContext } from "./carousel.types"

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
        slidesPerView: 1,
        spacing: "40px",
        inViewThreshold: 0,
        slideRects: [],
      },
      states: {
        idle: {
          on: {
            NEXT: {
              actions: ["setNextIndex", "measureElements", "scrollToNextSlide"],
            },
            PREV: {},
          },
        },
      },
      entry: ["measureElements"],
      computed: {
        isRtl: (ctx) => ctx.dir === "rtl",
        isHorizontal: (ctx) => ctx.orientation === "horizontal",
        isVertical: (ctx) => ctx.orientation === "vertical",
        startEdge(ctx) {
          if (ctx.isVertical) return "top"
          return ctx.isRtl ? "right" : "left"
        },
        endEdge(ctx) {
          if (ctx.isVertical) return "bottom"
          return ctx.isRtl ? "left" : "right"
        },
        containerSize(ctx) {
          if (!ctx.containerRect) return 0
          return ctx.isHorizontal ? ctx.containerRect.width : ctx.containerRect.height
        },
      },
    },
    {
      guards: {},
      actions: {
        setNextIndex(ctx) {
          const nextIndex = ctx.index + 1
          const maxIndex = ctx.slideRects.length - 1
          ctx.index = nextIndex > maxIndex ? 0 : nextIndex
        },
        scrollToNextSlide(ctx) {
          const nextIndex = ctx.index + 1
          const snaps = dom.getScrollSnaps(ctx)
          const nextSnap = snaps[nextIndex]
          dom.translateSlideGroup(ctx, nextSnap)
        },
        measureElements(ctx) {
          ctx.containerRect = ref(dom.getSlideGroupEl(ctx).getBoundingClientRect())
          ctx.slideRects = ref(dom.getSlideEls(ctx).map((slide) => slide.getBoundingClientRect()))
        },
      },
    },
  )
}
