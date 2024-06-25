import { createMachine, ref } from "@zag-js/core"
import { compact, isEqual, nextIndex, prevIndex } from "@zag-js/utils"
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
        slidesPerView: 1,
        spacing: "0px",
        ...ctx,
        scrollSnaps: [],
        scrollProgress: 0,
        containerSize: 0,
        slideRects: [],
      },

      watch: {
        index: ["setScrollSnaps"],
      },

      on: {
        NEXT: {
          actions: ["scrollToNext"],
        },
        PREV: {
          actions: ["scrollToPrev"],
        },
        GOTO: {
          actions: ["scrollTo"],
        },
        MEASURE_DOM: {
          actions: ["measureElements", "setScrollSnaps"],
        },
        PLAY: "autoplay",
      },

      states: {
        idle: {
          on: {
            POINTER_DOWN: "dragging",
          },
        },
        autoplay: {
          activities: ["trackDocumentVisibility"],
          every: {
            2000: ["scrollToNext"],
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
        canScrollPrev: (ctx) => ctx.loop || ctx.index > 0,
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
          const slideGroupEl = dom.getSlideGroupEl(ctx)
          if (!slideGroupEl) return
          const win = dom.getWin(ctx)
          const observer = new win.MutationObserver(() => {
            send({ type: "MEASURE_DOM", src: "mutation" })
          })
          observer.observe(slideGroupEl, { childList: true })
          return () => {
            observer.disconnect()
          }
        },
        trackContainerResize(ctx, _evt, { send }) {
          const slideGroupEl = dom.getSlideGroupEl(ctx)
          if (!slideGroupEl) return
          const win = dom.getWin(ctx)
          const observer = new win.ResizeObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.target === slideGroupEl) {
                send({ type: "MEASURE_DOM", src: "resize" })
              }
            })
          })
          observer.observe(slideGroupEl)
          return () => {
            observer.disconnect()
          }
        },
        trackDocumentVisibility(ctx, _evt, { send }) {
          const doc = dom.getDoc(ctx)
          const onVisibilityChange = () => {
            if (doc.visibilityState !== "visible") {
              send({ type: "PAUSE", src: "document-hidden" })
            }
          }
          doc.addEventListener("visibilitychange", onVisibilityChange)
          return () => {
            doc.removeEventListener("visibilitychange", onVisibilityChange)
          }
        },
      },
      guards: {
        loop: (ctx) => ctx.loop,
        isLastSlide: (ctx) => ctx.index === ctx.scrollSnaps.length - 1,
        isFirstSlide: (ctx) => ctx.index === 0,
      },
      actions: {
        scrollToNext(ctx) {
          const index = nextIndex(ctx.scrollSnaps, ctx.index)
          set.index(ctx, index)
        },
        scrollToPrev(ctx) {
          const index = prevIndex(ctx.scrollSnaps, ctx.index)
          set.index(ctx, index)
        },
        setScrollSnaps(ctx) {
          const { snapsAligned, scrollProgress } = getScrollSnaps(ctx)
          ctx.scrollSnaps = snapsAligned
          ctx.scrollProgress = scrollProgress
        },
        scrollTo(ctx, evt) {
          const index = Math.max(0, Math.min(evt.index, ctx.scrollSnaps.length - 1))
          set.index(ctx, index)
        },
        measureElements,
      },
    },
  )
}

const measureElements = (ctx: MachineContext) => {
  const slideGroupEl = dom.getSlideGroupEl(ctx)
  if (!slideGroupEl) return
  ctx.containerRect = ref(slideGroupEl.getBoundingClientRect())
  ctx.containerSize = ctx.isHorizontal ? ctx.containerRect.width : ctx.containerRect.height
  ctx.slideRects = ref(dom.getSlideEls(ctx).map((slide) => slide.getBoundingClientRect()))
}

const invoke = {
  change: (ctx: MachineContext) => {
    ctx.onIndexChange?.({ index: ctx.index })
  },
}

const set = {
  index: (ctx: MachineContext, index: number) => {
    if (isEqual(ctx.index, index)) return
    ctx.index = index
    invoke.change(ctx)
  },
}
